import boto3

# DynamoDB 클라이언트 생성
dynamodb = boto3.client('dynamodb')

# 검색 조건
title = "example_title"

scan_kwargs = {
    "FilterExpression": "contains(s3_key, :title) AND contains(s3_key, :imagequality)",
    "ExpressionAttributeValues": {
        ":title": {"S": title},
        ":imagequality": {"S": "1080"}
    }
}

# 테이블 이름 지정
table_name = "YourTableName"

# 스캔 실행
response = dynamodb.scan(TableName=table_name, **scan_kwargs)

# 결과 출력
items = response.get('Items', [])
for item in items:
    print(item)
