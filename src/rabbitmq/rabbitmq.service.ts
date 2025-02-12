import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

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
    this.channel.consume(queueName, (message) => {
      if (message) {
        const content = message.content.toString();
        console.log('Received message:', content);
        // TODO: Process the x-ray data
        this.channel.ack(message);
      }
    });
  }
}