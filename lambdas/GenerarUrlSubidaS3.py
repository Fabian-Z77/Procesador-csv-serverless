import json
import boto3

s3_client = boto3.client('s3')
BUCKET_NAME = 'procesador-csv-datos-entrada-2026'

def lambda_handler(event, context):
    try:
        query_params = event.get('queryStringParameters') or {}
        nombre_archivo = query_params.get('fileName', 'archivo_generico.csv')
        
        url_firmada = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': nombre_archivo,
                'ContentType': 'text/csv'
            },
            ExpiresIn=300
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps({
                'uploadURL': url_firmada,
                'fileName': nombre_archivo
            })
        }
    except Exception as e:
        print(f"Error interno: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            'body': json.dumps({'error': str(e)})
        }