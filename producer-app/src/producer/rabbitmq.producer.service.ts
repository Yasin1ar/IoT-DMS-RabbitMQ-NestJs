import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQProducerService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitMQProducerService.name);

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    this.connection = await amqp.connect('amqp://localhost:5672');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('x-ray-queue', { durable: true });
    this.logger.log('Connected to RabbitMQ and queue asserted.');
  }

  async sendXrayData(deviceId: string, data: any[]) {
    const message = JSON.stringify({ [deviceId]: { data } });
    this.channel.sendToQueue('x-ray-queue', Buffer.from(message));
    this.logger.log(`Sent x-ray data for device: ${deviceId}`);
  }
}
