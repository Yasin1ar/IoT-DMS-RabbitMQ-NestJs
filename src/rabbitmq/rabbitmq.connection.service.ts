import {
  Injectable,
  Optional,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class RabbitMQConnectionHelper implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly maxRetries: number;
  private connectionRetries = 0;
  private rabbitmqUrl: string;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
    @Optional() maxRetries = 5,
  ) {
    this.maxRetries = maxRetries;
    this.setupConfig();
  }
  async onModuleInit() {
    this.setupConfig();
  }

  private setupConfig() {
    const host = this.configService.get('RABBITMQ_HOST');
    const port = this.configService.get('RABBITMQ_PORT');
    const user = this.configService.get('RABBITMQ_USER');
    const password = this.configService.get('RABBITMQ_PASSWORD');
    this.rabbitmqUrl = `amqp://${user}:${password}@${host}:${port}`;
    this.queueName = this.configService.get('RABBITMQ_QUEUE', 'x-ray-queue');
    this.logger.log(`Configured RabbitMQ URL: ${this.rabbitmqUrl}`);
  }

  public getConnection() {
    return this.connection;
  }

  public getChannel() {
    return this.channel;
  }

  public getQueueName() {
    return this.queueName;
  }

  public async connectWithRetry(
    onConnect?: () => Promise<void> | void,
  ): Promise<void> {
    try {
      this.logger.log(`Attempting to connect to RabbitMQ`);
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.logger.log('Successfully connected to RabbitMQ and queue asserted');
      this.connectionRetries = 0;
      this.connection.on('error', () => this.attemptReconnect(onConnect));
      this.connection.on('close', () => this.attemptReconnect(onConnect));
      if (onConnect) await onConnect();
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
        return this.connectWithRetry(onConnect);
      } else {
        this.logger.error(`Maximum connection retries reached. Giving up.`);
        throw error;
      }
    }
  }

  private attemptReconnect(onConnect?: () => Promise<void> | void): void {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
      this.logger.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`,
      );
      setTimeout(async () => {
        try {
          await this.connectWithRetry(onConnect);
        } catch (error) {
          this.logger.error(`Reconnection failed: ${error.message}`);
        }
      }, delay);
    } else {
      this.logger.error(`Maximum reconnection attempts reached`);
    }
  }

  public async closeConnection() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ connection: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }
}
