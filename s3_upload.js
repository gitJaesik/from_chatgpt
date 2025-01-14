const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require("stream");

const bucketName = "your-bucket-name"; // S3 버킷 이름
const objectKey = "offset.txt"; // S3 객체 키
const region = "your-region"; // AWS 리전

const s3Client = new S3Client({ region });

/**
 * S3에서 파일 내용 읽기
 */
async function getObjectContent(bucket, key) {
  try {
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(getCommand);

    const stream = response.Body;
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

/**
 * S3에 파일 업로드
 */
async function putObjectContent(bucket, key, content) {
  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: content,
    ContentType: "text/plain",
  });
  await s3Client.send(putCommand);
}

/**
 * offset.txt 업데이트 함수
 */
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

  return newContent; // Lambda 응답
}

/**
 * Lambda 핸들러
 */
exports.handler = async (event) => {
  try {
    const updatedContent = await updateOffsetFile();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File updated successfully",
        content: updatedContent,
      }),
    };
  } catch (error) {
    console.error("Error updating file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating file",
        error: error.message,
      }),
    };
  }
};
