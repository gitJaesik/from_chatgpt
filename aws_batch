# 필요한 정보 추출
ATTRIBUTES=$(jq -c '.Table.AttributeDefinitions' existing_table_schema.json)
KEY_SCHEMA=$(jq -c '.Table.KeySchema' existing_table_schema.json)
READ_CAPACITY=$(jq '.Table.ProvisionedThroughput.ReadCapacityUnits' existing_table_schema.json)
WRITE_CAPACITY=$(jq '.Table.ProvisionedThroughput.WriteCapacityUnits' existing_table_schema.json)

# 새로운 테이블 생성
aws dynamodb create-table \
    --table-name NewTableName \
    --attribute-definitions "$ATTRIBUTES" \
    --key-schema "$KEY_SCHEMA" \
    --provisioned-throughput ReadCapacityUnits=$READ_CAPACITY,WriteCapacityUnits=$WRITE_CAPACITY
