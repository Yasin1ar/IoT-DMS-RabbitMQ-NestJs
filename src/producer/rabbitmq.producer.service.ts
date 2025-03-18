
/**
 * RabbitMQProducerService initializes a RabbitMQ connection, asserts a durable queue,
 * and provides a method to send x-ray data messages for a specified device.
 * Features include:
 * - Configuration via environment variables
 * - Automatic connection with exponential backoff retry
 * - Queue creation and message publishing
 * - Graceful shutdown handling
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQProducerService.name);
  private readonly rabbitmqUrl: string;
  private readonly queueName: string;
  private connectionRetries = 0;
  private readonly maxRetries = 5;

  constructor(private readonly configService: ConfigService) {
    // Get RabbitMQ connection details from environment variables with fallbacks
    const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
    const port = this.configService.get<string>('RABBITMQ_PORT', '5672');
    const user = this.configService.get<string>('RABBITMQ_USER', 'guest');
    const password = this.configService.get<string>('RABBITMQ_PASSWORD', 'guest');

    this.rabbitmqUrl = `amqp://${user}:${password}@${host}:${port}`;
    this.queueName = this.configService.get<string>('RABBITMQ_QUEUE', 'x-ray-queue');

    this.logger.log(`Configured RabbitMQ URL: ${this.rabbitmqUrl}`);
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    try {
      this.logger.log(`Attempting to connect to RabbitMQ`);
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.logger.log('Successfully connected to RabbitMQ and queue asserted');

      this.connectionRetries = 0;

      this.connection.on('error', () => this.attemptReconnect());
      this.connection.on('close', () => this.attemptReconnect());
    } catch (error) {
      this.connectionRetries++;
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);

      if (this.connectionRetries < this.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
        this.logger.log(
          `Retrying connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.connectWithRetry();
      } else {
        this.logger.error(`Maximum connection retries reached. Giving up.`);
        throw error;
      }
    }
  }

  private attemptReconnect(): void {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);

      this.logger.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`,
      );

      setTimeout(async () => {
        try {
          await this.connectWithRetry();
        } catch (error) {
          this.logger.error(`Reconnection failed: ${error.message}`);
        }
      }, delay);
    } else {
      this.logger.error(`Maximum reconnection attempts reached`);
    }
  }

  async sendXrayData(deviceId: string, data: any[]): Promise<boolean> {
    try {
      if (!this.channel) {
        this.logger.warn('Channel not available, attempting to reconnect');
        await this.connectWithRetry();
      }

      const message = JSON.stringify({ [deviceId]: { data } });
      const result = this.channel.sendToQueue(this.queueName, Buffer.from(message), { persistent: true });
      
      if (result) {
        this.logger.log(`Sent x-ray data for device: ${deviceId}`);
      } else {
        this.logger.warn(`Channel buffer full, message for device ${deviceId} not sent`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error sending x-ray data: ${error.message}`);
      await this.connectWithRetry();
      return false;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }
}
