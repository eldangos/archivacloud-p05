from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
import boto3
import os
import re
import uuid
import json
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Cargar variables de entorno
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")

# Cliente S3
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN")
)

HISTORY_FILE = "history.json"

def registrar_subida_historica(key: str):
    """Guarda un registro al momento exacto de generar la URL de subida"""
    historial = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                historial = json.load(f)
        except Exception:
            historial = []
            
    historial.append({
        "key": key,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    try:
        with open(HISTORY_FILE, "w") as f:
            json.dump(historial, f, indent=4)
    except Exception as e:
        print("Error guardando en historial:", e)

class UploadRequest(BaseModel): 
    fileName: str
    fileType: str
    fileSize: int = Field(..., description="Tamaño del archivo en bytes")

    @field_validator("fileName")
    def validate_file_name(cls, value):
        if "." not in value:
            raise ValueError("Nombre de archivo inválido.")
        sanitized = re.sub(r'[^a-zA-Z0-9._-]', '', value)
        if not sanitized:
            raise ValueError("Nombre de archivo inválido.")
        return sanitized

    @field_validator("fileType")
    def validate_file_type(cls, value):
        allowed_types = ["application/pdf", "image/jpeg", "image/jpg"]
        if value not in allowed_types:
            raise ValueError("Solo se permiten archivos PDF y JPG.")
        return value

    @field_validator("fileSize")
    def validate_file_size(cls, value):
        max_size = 12 * 1024 * 1024
        if value > max_size:
            raise ValueError("El archivo supera el tamaño máximo permitido de 12 MB.")
        return value

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

@app.get("/test-env")
async def test_env():
    return {"bucket": S3_BUCKET, "region": AWS_REGION}

@app.post("/api/upload/presigned-url")
async def get_presigned_url(request: UploadRequest):
    try:
        extension = request.fileName.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{extension}"
        key = f"uploads/{unique_filename}"

        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": key,
                "ContentType": request.fileType
            },
            ExpiresIn=3600
        )

        public_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        
        registrar_subida_historica(key)

        return {
            "presignedUrl": presigned_url,
            "key": key,
            "publicUrl": public_url
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al generar la URL firmada.")
    
@app.get("/api/files")
async def list_files():
    try:
        response = s3_client.list_objects_v2(
            Bucket=S3_BUCKET,
            Prefix="uploads/"
        )

        active_files = []
        for obj in response.get("Contents", []):
            active_files.append({
                "key": obj["Key"],
                "size": obj["Size"],
                "lastModified": obj["LastModified"].isoformat() 
            })

        # --- LÓGICA INTELIGENTE DE SINCRONIZACIÓN ---
        historial = []
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, "r") as f:
                    historial = json.load(f)
            except Exception:
                pass

        # 1. Asegurarnos de que todos los archivos de S3 estén en el historial
        history_keys = {item["key"] for item in historial}
        se_actualizo_historial = False

        for f in active_files:
            if f["key"] not in history_keys:
                historial.append({
                    "key": f["key"],
                    "timestamp": f["lastModified"]
                })
                se_actualizo_historial = True

        # 2. Guardar si tuvimos que agregar archivos antiguos al historial
        if se_actualizo_historial:
            try:
                with open(HISTORY_FILE, "w") as f:
                    json.dump(historial, f, indent=4)
            except Exception as e:
                print("Error actualizando historial:", e)

        # 3. Contar estrictamente desde el historial (nunca bajará al borrar en S3)
        limite_semanal = datetime.now(timezone.utc) - timedelta(days=7)
        contador_historico_semanal = 0

        for registro in historial:
            try:
                # Estandarizar la fecha por si viene con formato distinto
                ts = registro["timestamp"].replace("Z", "+00:00")
                fecha_registro = datetime.fromisoformat(ts)
                if fecha_registro >= limite_semanal:
                    contador_historico_semanal += 1
            except Exception:
                continue

        return {
            "activeFiles": active_files,
            "weeklyUploadsCount": contador_historico_semanal
        }

    except Exception:
        raise HTTPException(status_code=500, detail="Error al obtener la lista de archivos.")

@app.delete("/api/files/{key:path}")
async def delete_file(key: str):
    try:
        s3_client.delete_object(
            Bucket=S3_BUCKET,
            Key=key
        )
        return {
            "message": "Archivo eliminado correctamente",
            "key": key
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Error al eliminar el archivo.")