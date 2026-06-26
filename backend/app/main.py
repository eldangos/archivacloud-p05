import json
import os
import re
import uuid
from datetime import datetime, timezone, timedelta

import boto3
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator


# CONFIGURACIÓN DE LA APLICACIÓN

# Cargar variables de entorno
load_dotenv()

# Inicializa la aplicación FastAPI
app = FastAPI()



# Configuración CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Obtiene la configuración de AWS desde las variables de entorno
S3_BUCKET = os.getenv("S3_BUCKET")
AWS_REGION = os.getenv("AWS_REGION")

# Crea el cliente de Amazon S3 para gestionar archivos
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN")
)

# Archivo local utilizado para almacenar el historial
# de subidas y calcular el contador semanal.
HISTORY_FILE = "history.json"



# Recurso de DynamoDB
dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN")
)

# Referencia a la tabla
dynamodb_table = dynamodb.Table("database_dynamo")




# Registra cada subida realizada para mantener estadísticas históricas
def registrar_subida_historica(key: str):
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
        print("Error guardando historial:", e)



# Modelo que representa los datos enviados por el
# frontend al solicitar una URL prefirmada.

class UploadRequest(BaseModel): 
    fileName: str
    fileType: str
    fileSize: int = Field(..., description="Tamaño del archivo en bytes")


# Valida y sanitiza el nombre del archivo
    @field_validator("fileName")
    def validate_file_name(cls, value):
        if "." not in value:
            raise ValueError("Nombre de archivo inválido.")
        sanitized = re.sub(r'[^a-zA-Z0-9._-]', '', value)
        if not sanitized:
            raise ValueError("Nombre de archivo inválido.")
        return sanitized
    

# Verifica que el tipo de archivo sea permitido
    @field_validator("fileType")
    def validate_file_type(cls, value):
        allowed_types = ["application/pdf", "image/jpeg", "image/jpg"]
        if value not in allowed_types:
            raise ValueError("Solo se permiten archivos PDF y JPG.")
        return value
    
# Verifica que el tamaño del archivo no supere el límite permitido
    @field_validator("fileSize")
    def validate_file_size(cls, value):
        max_size = 12 * 1024 * 1024
        if value > max_size:
            raise ValueError("El archivo supera el tamaño máximo permitido de 12 MB.")
        return value
    
# Endpoint para comprobar que la API está funcionando correctamente
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Endpoint de prueba para verificar variables de entorno
@app.get("/test-env")
async def test_env():
    return {"bucket": S3_BUCKET, "region": AWS_REGION}


# Genera una URL prefirmada para que el frontend
# pueda subir el archivo directamente a Amazon S3
# sin pasar el contenido por el backend.

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

        try:
            # Guarda los metadatos del archivo en DynamoDB.
            # No almacena el archivo, solamente su información.
            dynamodb_table.put_item(
                Item={
                    "id_tabla": str(uuid.uuid4()),
                    "nombre_proyecto": "ArchivaCloud P-05",
                    "nombre_archivo": request.fileName,
                    "s3_key": key,
                    "tipo": request.fileType,
                    "tamano": request.fileSize,
                    "fecha_subida": datetime.now(timezone.utc).isoformat()
                    
                }
            )
        except Exception as e:
            print("Error al guardar en DynamoDB:", e)

        return {
            "presignedUrl": presigned_url,
            "key": key,
            "publicUrl": public_url
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    

    
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

        # Sincroniza el historial local con los archivos existentes en Amazon S3 para mantener el contador
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
    

# Elimina un archivo del bucket de Amazon S3
# utilizando la clave recibida desde el frontend.
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