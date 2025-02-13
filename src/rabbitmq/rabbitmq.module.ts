/**
 * The RabbitMQModule is responsible for managing RabbitMQ service and its dependencies.
 * It imports and configures the ConfigModule and SignalsModule, and exports the RabbitMQService.
 */
import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ConfigModule } from '@nestjs/config';
import { SignalsModule } from '../signals/signals.module';

@Module({
  imports: [ConfigModule.forRoot(), SignalsModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
