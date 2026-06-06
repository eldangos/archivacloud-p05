# ArchivaCloud P-05

## Integrantes
- Giorgio Wojciechowski
- Dilan Espinoza

## Descripción
Sistema de almacenamiento de archivos en Amazon S3. 
**Parámetros únicos respetados (Pareja P-05):**
- Tipos de archivo permitidos: PDF, JPG
- Tamaño máximo: 12 MB
- Nombre del bucket: archivacloud-p05
- Región: us-east-1
- Feature extra obligatoria: Mostrar un contador de "archivos subidos esta semana" en la pantalla principal.

## Tecnologías (Stack)
- Backend: Python 3.10+, FastAPI, Boto3, Uvicorn
- Frontend: React 18 + Vite (Próximamente)
- Nube: AWS S3 y IAM

## Cómo ejecutar el backend localmente
1. Entrar a la carpeta: `cd backend`
2. Crear y activar el entorno virtual: `python -m venv venv` y `.\venv\Scripts\activate`
3. Instalar dependencias: `pip install -r requirements.txt`
4. Ejecutar servidor: `python -m uvicorn app.main:app --reload`