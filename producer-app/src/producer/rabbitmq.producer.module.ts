import { Module } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { IotSimulatorService } from './iot.simulator.service';

@Module({
  providers: [RabbitMQProducerService, IotSimulatorService],
})
export class ProducerModule {}
