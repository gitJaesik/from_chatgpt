import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SqsService } from "./sqs.service";

@Injectable()
export class SqsPollingService {
  constructor(private readonly sqsService: SqsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.sqsService.pollMessages();
  }
}
