/**
 * `RabbitMQService` handles connection to RabbitMQ, queue creation,
 * and consumption of messages for processing x-ray data.
 */
import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { SignalService } from '../signals/signals.service';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQService.name); 

  constructor(private readonly signalsService: SignalService) {}

  async onModuleInit() {
    await this.connect();
    await this.createQueue('x-ray-queue');
    this.consumeMessages('x-ray-queue');
  }

  private async connect() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
  }

  private async createQueue(queueName: string) {
    await this.channel.assertQueue(queueName, { durable: true });
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
        } catch (error) {
          this.logger.error(`Error processing x-ray data: ${error.message}`);
          this.channel.ack(message); // Prevent infinite loop by acknowledging invalid messages
        }
      }
    });
  }
}
