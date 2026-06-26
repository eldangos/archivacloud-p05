Sprint N° 1
Fecha:	11/06/2026
Lo que hicimos esta semana (4-6 líneas):	

Durante el Sprint 1 implementamos el backend en FastAPI y la integración inicial con AWS S3. Se creó el endpoint para generar URLs firmadas (Presigned URL), permitiendo la carga segura de archivos al bucket sin exponer credenciales. Además, se desarrollaron las validaciones obligatorias de la pareja P-05, restringiendo los formatos a PDF y JPG y limitando el tamaño máximo a 12 MB. Finalmente, se realizaron pruebas mediante Swagger y se documentó el avance en GitHub.

Problemas encontrados:	

Dificultades iniciales para conectar FastAPI con AWS S3.
Errores al configurar las credenciales temporales proporcionadas por AWS Academy.
Validaciones de formato y tamaño de archivo que inicialmente no funcionaban correctamente.

Cómo los resolvimos:	

Revisamos la configuración de variables de entorno y las credenciales AWS.
Realizamos pruebas utilizando Swagger para verificar el funcionamiento de la API.
Implementamos validaciones en FastAPI para restringir archivos a PDF y JPG con un máximo de 12 MB.

Usos de IA esta semana:	

Apoyo en la configuración de FastAPI y AWS S3.
Ayuda para generar y validar código de endpoints.
Asistencia en la resolución de errores de configuración y validaciones.

Próximos pasos:	

Implementar funcionalidades para listar y eliminar archivos almacenados.
Desarrollar una interfaz frontend para interactuar con la API.
Realizar pruebas de integración entre frontend, backend y AWS S3.

Firmas (ambos integrantes):	__________________________   __________________________
Firma docente:	__________________________






Sprint N° 2
Fecha:	18/06/2026
Lo que hicimos esta semana (4-6 líneas):	

Durante el Sprint 2 se implementaron los endpoints para listar y eliminar archivos almacenados en AWS S3. Además, se integró un frontend en React capaz de consumir la API desarrollada en FastAPI. Se realizaron pruebas de conectividad entre React, FastAPI y AWS S3, verificando la correcta visualización de archivos almacenados en el bucket. También se solucionaron problemas relacionados con credenciales temporales, configuración del bucket y políticas de acceso.

Problemas encontrados:	

Errores de acceso a S3 (AccessDenied).
Expiración de credenciales temporales de AWS Academy.
Problemas de CORS al conectar React con FastAPI.
Uso incorrecto del nombre del bucket durante las pruebas.

Cómo los resolvimos:	

Actualizamos las credenciales AWS cuando expiraron.
Corregimos el nombre del bucket utilizado por la aplicación.
Configuramos CORS en FastAPI para permitir solicitudes desde React.
Verificamos el acceso al bucket mediante AWS CLI y pruebas en Swagger.

Usos de IA esta semana:	

Apoyo en la integración entre React, FastAPI y AWS S3.
Asistencia en la resolución de errores de AWS y configuración de credenciales.
Ayuda para implementar los endpoints de listado y eliminación de archivos.
Orientación para pruebas y validación del funcionamiento del sistema.

Próximos pasos:	

Finalizar la integración completa de subida y eliminación de archivos desde el frontend.
Mejorar la interfaz gráfica de usuario.
Realizar pruebas funcionales completas del sistema.
Preparar la documentación y evidencias para la entrega final.

Firmas (ambos integrantes):	__________________________   __________________________
Firma docente:	__________________________


Sprint N° 3

**Fecha:** 25/06/2026

### Lo que hicimos esta semana (4-6 líneas):

Durante el Sprint 3 se fortaleció la seguridad del proyecto mediante la implementación de las medidas solicitadas en la pauta SEC-01 a SEC-10. Se incorporaron validaciones de tipo y tamaño de archivos utilizando Pydantic, se sanitizó el nombre de los archivos antes de almacenarlos y se configuró el acceso mediante variables de entorno. Además, se implementó el contador de archivos subidos durante la última semana utilizando un historial local (`history.json`), se verificó el cifrado del bucket S3 y se realizaron pruebas funcionales de subida, listado y eliminación de archivos.

### Problemas encontrados:

* Restricciones de AWS Academy para consultar y modificar políticas IAM.
* Dificultades para probar la validación del límite de 12 MB por no disponer de archivos de gran tamaño.
* Resultados de `pip-audit` mostrando vulnerabilidades en paquetes que no pertenecían al proyecto.
* El contador semanal disminuía al eliminar archivos del bucket S3.

### Cómo los resolvimos:

* Se documentaron las limitaciones del entorno AWS Academy respecto a IAM.
* Se generó un archivo de prueba superior a 12 MB para validar correctamente la restricción.
* Se revisó el archivo `requirements.txt` y se verificó que las dependencias utilizadas estuvieran actualizadas.
* Se implementó un archivo `history.json` para conservar el historial de subidas y calcular el contador semanal sin depender únicamente del contenido actual del bucket.

### Usos de IA esta semana:

* Apoyo en la implementación de las medidas de seguridad SEC-01 a SEC-10.
* Asistencia para configurar CORS y validar el uso de variables de entorno.
* Ayuda en el diseño e implementación del contador de archivos subidos durante la última semana.
* Revisión del código, resolución de errores y elaboración de la documentación técnica del proyecto.

### Próximos pasos:

* Finalizar la documentación del proyecto (README, reporte de seguridad y documentación de la feature extra).
* Preparar la defensa técnica del proyecto y repasar el funcionamiento del backend.
* Integrar DynamoDB como almacenamiento de metadatos de los archivos.
* Realizar la revisión final del repositorio antes de generar la versión 1.0.0.

**Firmas (ambos integrantes):**
__________________________  __________________________

**Firma docente:**

---
