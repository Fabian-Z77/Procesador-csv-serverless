import json
import boto3

dynamodb = boto3.resource('dynamodb')
tabla_metricas = dynamodb.Table('MetricasArchivosCSV')

def lambda_handler(event, context):
    try:
        query_params = event.get('queryStringParameters') or {}
        id_archivo = query_params.get('id_archivo')

        if not id_archivo:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Falta el nombre del archivo'})
            }

        
        tabla_metricas.delete_item(
            Key={
                'id_archivo': id_archivo
            }
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                # permiso DELETE al CORS
                'Access-Control-Allow-Methods': 'OPTIONS,GET,DELETE'
            },
            'body': json.dumps({'mensaje': f'Registro {id_archivo} eliminado'})
        }

    except Exception as e:
        print(f"Error interno: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }