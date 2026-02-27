import pandas as pd
import boto3
import io
import json

s3_client = boto3.client('s3')
# cliente de DynamoDB
dynamodb = boto3.resource('dynamodb') 
# Conexión con la tabla
tabla_metricas = dynamodb.Table('MetricasArchivosCSV') 

def lambda_handler(event, context):
    try:
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        file_key = event['Records'][0]['s3']['object']['key'] 
        
        print(f"Procesando: {file_key} desde {bucket_name}")

        respuesta_s3 = s3_client.get_object(Bucket=bucket_name, Key=file_key)
        contenido_en_memoria = respuesta_s3['Body'].read()

        df = pd.read_csv(io.BytesIO(contenido_en_memoria))
        
        # --- Lógica Pandas ---
        total_filas = int(df.shape[0])
        nulos_dict = df.isnull().sum().to_dict()
        
        metricas_calculadas = {
            "total_registros": total_filas,
            "nulos": nulos_dict
        }
        
        print("Análisis completado. Guardando en DynamoDB...")
        
        tabla_metricas.put_item(
            Item={
                'id_archivo': file_key, # Ej: "df_consolidado.csv"
                'datos_procesados': json.dumps(metricas_calculadas) # Dict como texto JSON
            }
        )
        
        print("Guardado exitoso en base de datos!")

        return {
            'statusCode': 200,
            'body': json.dumps('Proceso y guardado completados')
        }

    except Exception as e:
        print(f" Error fatal: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error interno')
        }