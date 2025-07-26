import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConnectionHelper } from '../rabbitmq/rabbitmq.connection.service';
import { XrayDataEntry } from './iot.simulator.service';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly configService: ConfigService,
    private readonly connectionHelper: RabbitMQConnectionHelper,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    await this.connectionHelper.connectWithRetry();
  }

  async sendXrayData(
    deviceId: string,
    data: XrayDataEntry[],
  ): Promise<boolean> {
    try {
      const channel = this.connectionHelper.getChannel();
      const queueName = this.connectionHelper.getQueueName();
      if (!channel) {
        this.logger.warn('Channel not available, attempting to reconnect');
        await this.connectionHelper.connectWithRetry();
      }
      const message = JSON.stringify({ [deviceId]: { data } });
      const result = channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
      if (result) {
        this.logger.log(`Sent x-ray data for device: ${deviceId}`);
      } else {
        this.logger.warn(
          `Channel buffer full, message for device ${deviceId} not sent`,
        );
      }
      return result;
    } catch (error) {
      this.logger.error(`Error sending x-ray data: ${error.message}`);
      await this.connectionHelper.connectWithRetry();
      return false;
    }
  }

  async onModuleDestroy() {
    await this.connectionHelper.closeConnection();
  }
}
