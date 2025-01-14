import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// S3 설정
const bucketName = "your-bucket-name";
const objectKey = "offset.txt";
const region = "your-region";

const s3Client = new S3Client({ region });

async function getObjectContent(bucket, key) {
  try {
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(getCommand);

    const stream = response.Body as Readable;
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return null; // 파일이 없으면 null 반환
    }
    throw error;
  }
}

async function putObjectContent(bucket, key, content) {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: content,
    ContentType: "text/plain",
  });
  await s3Client.send(putCommand);
}

async function updateOffsetFile() {
  const existingContent = await getObjectContent(bucketName, objectKey);
  let newContent;

  if (!existingContent) {
    // 파일이 없으면 새로 생성
    newContent = "10";
  } else {
    // 파일이 있으면 기존 내용 읽어서 숫자 업데이트
    const lines = existingContent.split("\n").filter(line => line.trim() !== "");
    const lastNumber = parseInt(lines[lines.length - 1], 10);
    const newNumber = lastNumber + Math.floor(Math.random() * 10) + 1; // 새 숫자 추가
    newContent = `${existingContent}\n${newNumber}`;
  }

  // S3에 업데이트된 내용 업로드
  await putObjectContent(bucketName, objectKey, newContent);
  console.log("Updated content:");
  console.log(newContent);
}

// 실행
updateOffsetFile().catch(console.error);
