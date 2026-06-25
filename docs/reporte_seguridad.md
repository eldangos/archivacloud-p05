# Reporte de Seguridad - ArchivaCloud P-05

## Información General

**Proyecto:** ArchivaCloud P-05

**Integrantes:**

* Giorgio Wojciechowski
* Dilan Espinoza

**Backend:** FastAPI

**Frontend:** React + Vite

**Proveedor Cloud:** Amazon Web Services (AWS)


# SEC-01 – Secretos fuera del repositorio

Las credenciales de AWS utilizadas por la aplicación se almacenan mediante variables de entorno en un archivo `.env`, el cual se encuentra incluido en el archivo `.gitignore` para evitar su publicación en el repositorio.

Se incorpora además un archivo `.env.example` con los nombres de las variables requeridas, sin incluir información sensible.

**Resultado:** Las credenciales no forman parte del código fuente ni del historial del repositorio.

---

# SEC-02 – CORS restrictivo

Se configuró el middleware `CORSMiddleware` de FastAPI permitiendo únicamente solicitudes provenientes del frontend desarrollado para el proyecto.

```python
allow_origins=[
    "http://localhost:5173"
]
```

No se utiliza el comodín (`*`), evitando que otros dominios puedan consumir la API durante el desarrollo.

**Resultado:** El acceso al backend queda restringido únicamente al origen autorizado.


# SEC-03 – Validación de entrada

Se implementó validación utilizando modelos de Pydantic.

Se valida:

* Nombre del archivo.
* Tipo MIME permitido.
* Tamaño máximo permitido.

Además, el nombre del archivo es sanitizado mediante expresiones regulares para eliminar caracteres potencialmente peligrosos.

**Resultado:** Sólo se aceptan archivos PDF y JPG válidos con nombres seguros.


# SEC-04 – Límite de tamaño

El tamaño máximo permitido es de **12 MB**, correspondiente al parámetro asignado a la pareja P-05.

La validación se realiza tanto en:

* Frontend (React)
* Backend (FastAPI)

Esto evita cargas innecesarias y protege el servicio frente a archivos excesivamente grandes.



# SEC-05 – IAM mínimo privilegio

El proyecto fue desarrollado utilizando AWS Academy Learner Lab.

Debido a las restricciones del laboratorio, no fue posible crear usuarios IAM ni modificar las políticas administradas por AWS Academy.

La aplicación únicamente realiza operaciones necesarias sobre Amazon S3, tales como:

* PutObject
* ListBucket
* DeleteObject

El acceso se realiza mediante el rol temporal asignado por el laboratorio.



# SEC-06 – Bucket privado

Se verificó que el bucket de Amazon S3 mantiene habilitado **Block Public Access**, impidiendo el acceso público directo a los objetos almacenados.

El acceso a los archivos se realiza únicamente mediante URLs prefirmadas generadas por el backend.


# SEC-07 – Manejo de errores

La API captura las excepciones utilizando `HTTPException`.

Los mensajes devueltos al cliente son genéricos y no incluyen información interna, credenciales ni trazas del servidor.



# SEC-08 – Cifrado en reposo

El bucket S3 utiliza **Server Side Encryption (SSE-S3)** administrado por Amazon S3.

Esto garantiza que todos los objetos almacenados permanezcan cifrados automáticamente.



# SEC-09 – Auditoría de dependencias

Se ejecutaron las siguientes herramientas:

* `npm audit`
* `pip-audit`

El frontend no presentó vulnerabilidades.

Las dependencias utilizadas por el backend fueron actualizadas a versiones corregidas cuando fue posible.

Las vulnerabilidades restantes correspondían a paquetes externos no utilizados por la aplicación.



# SEC-10 – TLS de extremo a extremo

Durante el desarrollo local se utilizaron direcciones HTTP para facilitar las pruebas.

En un entorno de producción la aplicación debe desplegarse utilizando HTTPS.

Las cargas hacia Amazon S3 utilizan URLs prefirmadas generadas por AWS, las cuales emplean HTTPS de forma predeterminada.

Esto garantiza el cifrado de la información durante la transmisión.


# Conclusiones

El proyecto ArchivaCloud implementa controles de seguridad orientados a proteger la confidencialidad de las credenciales, validar la entrada de datos, restringir el acceso al backend, asegurar el almacenamiento de archivos y utilizar comunicaciones cifradas.

Estas medidas permiten reducir riesgos comunes asociados al desarrollo de aplicaciones web conectadas con servicios de almacenamiento en la nube.
