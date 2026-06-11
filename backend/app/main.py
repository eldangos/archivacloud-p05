from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
import boto3
import os
import uuid
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

# Variables de 

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


# ==========================================
# MODELO DE VALIDACIÓN (P-05)
# PDF y JPG - Máximo 12 MB
# ==========================================

class UploadRequest(BaseModel): 
    fileName: str
    fileType: str
    fileSize: int = Field(..., description="Tamaño del archivo en bytes")

    @field_validator("fileType")
    def validate_file_type(cls, value):
        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/jpg"
        ]

        if value not in allowed_types:
            raise ValueError(
                "Solo se permiten archivos PDF y JPG."
            )

        return value

    @field_validator("fileSize")
    def validate_file_size(cls, value):
        max_size = 12 * 1024 * 1024  # 12 MB

        if value > max_size:
            raise ValueError(
                "El archivo supera el tamaño máximo permitido de 12 MB."
            )

        return value


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/healthz")
async def health_check():
    return {
        "status": "ok"
    }


# ==========================================
# TEST VARIABLES DE ENTORNO
# ==========================================

@app.get("/test-env")
async def test_env():
    return {
        "bucket": S3_BUCKET,
        "region": AWS_REGION
    }


# ==========================================
# SPRINT 1
# POST /api/upload/presigned-url
# ==========================================

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

        public_url = (
            f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"
        )

        return {
            "presignedUrl": presigned_url,
            "key": key,
            "publicUrl": public_url
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Error interno al generar la URL firmada."
        )
    
@app.get("/api/files")
async def list_files():
    try:

        response = s3_client.list_objects_v2(
            Bucket=S3_BUCKET,
            Prefix="uploads/"
        )

        files = []

        for obj in response.get("Contents", []):

            files.append({
                "key": obj["Key"],
                "size": obj["Size"],
                "lastModified": str(obj["LastModified"])
            })

        return files

    except Exception as e:
        print("ERROR S3:", e)

    raise HTTPException(
        status_code=500,
        detail="Error al obtener la lista de archivos."
    )

# ==========================================
# SPRINT 2
# DELETE /api/files/{key}
# ==========================================

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
        raise HTTPException(
            status_code=500,
            detail="Error al eliminar el archivo."
        )