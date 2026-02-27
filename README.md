# Arquitectura Serverless Event-Driven: Procesador de CSV

Este proyecto es una aplicación full-stack que permite a los usuarios subir datasets en formato CSV, los cuales son procesados automáticamente en la nube (AWS) para extraer métricas de calidad de datos (como el conteo de valores nulos y total de registros).

## Tecnologías Utilizadas
* **Frontend:** React, TypeScript, Vite, Recharts (Gráficos).
* **Backend & Análisis:** Python 3.10, Pandas.
* **Infraestructura Cloud (AWS):** * **S3:** Almacenamiento y triggers de eventos.
  * **AWS Lambda:** Computación serverless en memoria RAM (`io.BytesIO`).
  * **DynamoDB:** Base de datos NoSQL para almacenar resultados en JSON.
  * **API Gateway:** Enrutamiento HTTP y manejo de CORS.
  * **IAM:** Gestión estricta de permisos y roles de seguridad.

## ¿Cómo funciona la arquitectura?
1. El usuario selecciona un archivo en React. El frontend solicita una **Presigned URL** a API Gateway.
2. El archivo se sube de forma segura y directa al bucket de **S3**.
3. La llegada del archivo dispara un evento (S3 Trigger) que despierta una función **Lambda**.
4. La Lambda carga una capa (Layer) de **Pandas**, lee el archivo en memoria, procesa la calidad de los datos y guarda un JSON en **DynamoDB**.
5. El frontend consume las métricas a través de otra Lambda y las visualiza en un dashboard con **Recharts**.

## Autor
**Fabián Mauricio Galaz González**
*Egresado de Ingeniería Informática - En búsqueda de práctica profesional (Data Analyst / Developer)*