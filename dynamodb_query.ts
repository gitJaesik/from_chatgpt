import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

// DynamoDB 클라이언트를 생성합니다.
const client = new DynamoDBClient({ region: "your-region" });

// someId가 일치하고 someValue가 비어 있지 않은 항목 중에서 created_at이 최신인 항목 1개를 가져오는 함수
const queryLatestItem = async (someId: string) => {
  const params = {
    TableName: "YourTableName",
    IndexName: "YourGSIName", // GSI 이름을 지정합니다.
    KeyConditionExpression: "someId = :someId",
    FilterExpression: "attribute_exists(someValue) AND someValue <> :emptyString",
    ExpressionAttributeValues: {
      ":someId": { S: someId },
      ":emptyString": { S: "" }
    },
    ScanIndexForward: false, // 최신 항목이 먼저 나오도록 정렬 순서 설정
    Limit: 1 // 결과를 1개로 제한
  };

  try {
    const data = await client.send(new QueryCommand(params));
    if (data.Items && data.Items.length > 0) {
      console.log("Latest item:", data.Items[0]);
      return data.Items[0];
    } else {
      console.log("No matching items found.");
      return null;
    }
  } catch (err) {
    console.error("Query failed:", err);
    throw err;
  }
};

// 사용 예제
(async () => {
  try {
    const someId = "your-someId-value";
    const latestItem = await queryLatestItem(someId);
    // 결과 처리
  } catch (err) {
    console.error("Error:", err);
  }
})();
