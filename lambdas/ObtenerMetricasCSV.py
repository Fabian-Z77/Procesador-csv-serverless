import json
import boto3

# Conectar con DynamoDB
dynamodb = boto3.resource('dynamodb')
tabla_metricas = dynamodb.Table('MetricasArchivosCSV')

def lambda_handler(event, context):
    try:
        respuesta = tabla_metricas.scan()
        items = respuesta.get('Items', [])

        return {
            'statusCode': 200,
            # Evitar Error
            'headers': {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            # Devolver la lista de items convertida a texto JSON
            'body': json.dumps(items)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error interno del servidor")
        }