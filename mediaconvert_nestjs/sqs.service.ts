import { Injectable, Logger } from "@nestjs/common";
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;
  private queueUrl: string = "YOUR_SQS_QUEUE_URL"; // SQS 큐 URL

  constructor() {
    this.sqsClient = new SQSClient({ region: "YOUR_AWS_REGION" });
  }

  async pollMessages(): Promise<void> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    });

    try {
      const { Messages } = await this.sqsClient.send(command);

      if (Messages && Messages.length > 0) {
        for (const message of Messages) {
          this.logger.log(`Received message: ${message.Body}`);

          // 메시지 처리 로직 추가

          // 메시지 삭제
          if (message.ReceiptHandle) {
            await this.deleteMessage(message.ReceiptHandle);
          }
        }
      }
    } catch (error) {
      this.logger.error("Error receiving messages from SQS", error);
    }
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    try {
      await this.sqsClient.send(command);
      this.logger.log("Deleted message from SQS");
    } catch (error) {
      this.logger.error("Error deleting message from SQS", error);
    }
  }
}
