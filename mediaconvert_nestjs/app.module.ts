import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { SqsService } from "./sqs.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SqsService],
})
export class AppModule {}
