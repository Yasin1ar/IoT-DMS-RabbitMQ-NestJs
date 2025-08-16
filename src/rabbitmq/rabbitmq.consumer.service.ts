import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SignalService } from '../signals/signals.service';
import { RabbitMQConnectionHelper } from './rabbitmq.connection.service';
import { XrayDataEntry } from '../producer/iot.simulator.service';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly signalsService: SignalService,
    private readonly connectionHelper: RabbitMQConnectionHelper,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    await this.connectionHelper.connectWithRetry(async () => {
      await this.createQueueAndConsume();
    });
  }

  private async createQueueAndConsume() {
    const channel = this.connectionHelper.getChannel();
    const queueName = this.connectionHelper.getQueueName();
    await channel.assertQueue(queueName, { durable: true });
    this.consumeMessages(queueName);
  }

  private async consumeMessages(queueName: string) {
    const channel = this.connectionHelper.getChannel();
    channel.consume(queueName, async (message) => {
      if (message) {
        try {
          const content = JSON.parse(message.content.toString());
          const deviceId = Object.keys(content)[0];
          const data: XrayDataEntry[] = content[deviceId]?.data;
          if (!Array.isArray(data)) {
            throw new Error('Invalid x-ray data structure');
          }
          await this.signalsService.processAndSaveXrayData(deviceId, data);
          channel.ack(message);
          this.logger.debug(
            `Successfully processed message for device ${deviceId}`,
          );
        } catch (error) {
          this.logger.error(`Error processing x-ray data: ${error.message}`);
          channel.ack(message);
        }
      }
    });
    this.logger.log(`Started consuming messages from queue ${queueName}`);
  }

  async onModuleDestroy() {
    await this.connectionHelper.closeConnection();
  }
}
