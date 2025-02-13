/**
 * Module that aggregates producer services, specifically the RabbitMQ producer and IoT simulator.
 */
import { Module } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { IotSimulatorService } from './iot.simulator.service';

@Module({
  providers: [RabbitMQProducerService, IotSimulatorService],
})
export class ProducerModule {}
