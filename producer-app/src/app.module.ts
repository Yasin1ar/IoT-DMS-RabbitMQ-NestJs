import { Module } from '@nestjs/common';
import { ProducerModule } from './producer/rabbitmq.producer.module';

@Module({
  imports: [ProducerModule],
})
export class AppModule {}
