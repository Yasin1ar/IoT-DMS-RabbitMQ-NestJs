/**
 * RabbitMQService
 *
 * Handles connection to RabbitMQ message broker, message consumption,
 * and processing of X-ray data messages. Features include:
 * - Automatic connection with exponential backoff retry
 * - Queue creation and message consumption
 * - Processing of X-ray data through SignalService
 * - Graceful shutdown handling
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { SignalService } from '../signals/signals.service';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly rabbitmqUrl: string;
  private readonly queueName: string;
  private connectionRetries = 0;
  private readonly maxRetries = 5;

  constructor(
    private readonly signalsService: SignalService,
    private readonly configService: ConfigService,
  ) {
    // Get RabbitMQ connection details from environment variables with fallbacks
    const host = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
    const port = this.configService.get<string>('RABBITMQ_PORT', '5672');
    const user = this.configService.get<string>('RABBITMQ_USER', 'guest');
    const password = this.configService.get<string>(
      'RABBITMQ_PASSWORD',
      'guest',
    );

    this.rabbitmqUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      `amqp://${user}:${password}@${host}:${port}`,
    );

    this.queueName = this.configService.get<string>(
      'RABBITMQ_QUEUE',
      'x-ray-queue',
    );

    this.logger.log(`Configured RabbitMQ URL: ${this.rabbitmqUrl}`);
  }

  async onModuleInit() {
    await this.connectWithRetry();
    await this.createQueue(this.queueName);
    this.consumeMessages(this.queueName);
  }

  private async connectWithRetry(): Promise<void> {
    try {
      this.logger.log(`Attempting to connect to RabbitMQ`);
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      this.logger.log('Successfully connected to RabbitMQ');

      this.connectionRetries = 0;

      this.connection.on('error', () => this.attemptReconnect());
      this.connection.on('close', () => this.attemptReconnect());
    } catch (error) {
      this.connectionRetries++;
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);

      if (this.connectionRetries < this.maxRetries) {
        const delay = Math.min(
          1000 * Math.pow(2, this.connectionRetries),
          30000,
        );
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
          if (this.channel) {
            await this.createQueue(this.queueName);
            this.consumeMessages(this.queueName);
          }
        } catch (error) {
          this.logger.error(`Reconnection failed: ${error.message}`);
        }
      }, delay);
    } else {
      this.logger.error(`Maximum reconnection attempts reached`);
    }
  }

  private async createQueue(queueName: string) {
    await this.channel.assertQueue(queueName, { durable: true });
    this.logger.log(`Queue ${queueName} created or confirmed`);
  }

  private async consumeMessages(queueName: string) {
    this.channel.consume(queueName, async (message) => {
      if (message) {
        try {
          const content = JSON.parse(message.content.toString());
          const deviceId = Object.keys(content)[0];
          const data = content[deviceId]?.data;

          if (!data) {
            throw new Error('Invalid x-ray data structure');
          }

          await this.signalsService.processAndSaveXrayData(deviceId, data);
          this.channel.ack(message);
          this.logger.debug(
            `Successfully processed message for device ${deviceId}`,
          );
        } catch (error) {
          this.logger.error(`Error processing x-ray data: ${error.message}`);
          this.channel.ack(message);
        }
      }
    });
    this.logger.log(`Started consuming messages from queue ${queueName}`);
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
