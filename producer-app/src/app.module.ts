/**
 * AppModule serves as the root module of the application.
 * It imports the ProducerModule to manage messaging functionality.
 */
import { Module } from '@nestjs/common';
import { ProducerModule } from './producer/rabbitmq.producer.module';

@Module({
  imports: [ProducerModule],
})
export class AppModule {}
