✅ 1. Users 테이블 만들기 (id를 PK로, email을 GSI로)

```bash
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions \
      AttributeName=id,AttributeType=S \
      AttributeName=email,AttributeType=S \
  --key-schema \
      AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
      "[
          {
              \"IndexName\": \"email-index\",
              \"KeySchema\": [{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],
              \"Projection\": {\"ProjectionType\":\"ALL\"},
              \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
          }
      ]" \
  --billing-mode PAY_PER_REQUEST
```

✅ 2. OwnerToken 테이블 만들기 (owner를 PK로)

```bash
aws dynamodb create-table \
  --table-name OwnerToken \
  --attribute-definitions \
      AttributeName=owner,AttributeType=S \
  --key-schema \
      AttributeName=owner,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

check

```bash
aws dynamodb describe-table --table-name Users
```
