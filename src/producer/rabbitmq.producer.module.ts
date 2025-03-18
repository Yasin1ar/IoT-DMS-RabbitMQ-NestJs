/**
 * Module that aggregates producer services, specifically the RabbitMQ producer and IoT simulator.
 */
import { Module } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { ConfigModule } from '@nestjs/config';

import { IotSimulatorService } from './iot.simulator.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [RabbitMQProducerService, IotSimulatorService],
})
export class ProducerModule {}
