import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.consumer.service';
import { ConfigModule } from '@nestjs/config';
import { SignalsModule } from '../signals/signals.module';
import { RabbitMQConnectionHelper } from './rabbitmq.connection.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ConfigModule.forRoot(), SignalsModule, CommonModule],
  providers: [RabbitMQService, RabbitMQConnectionHelper],
  exports: [RabbitMQService, RabbitMQConnectionHelper],
})
export class RabbitMQModule {}
