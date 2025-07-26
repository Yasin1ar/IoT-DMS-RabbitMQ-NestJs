import { Module } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { ConfigModule } from '@nestjs/config';

import { IotSimulatorService } from './iot.simulator.service';
import { RabbitMQConnectionHelper } from 'src/rabbitmq/rabbitmq.connection.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ConfigModule.forRoot(), CommonModule],
  providers: [
    RabbitMQProducerService,
    IotSimulatorService,
    RabbitMQConnectionHelper,
  ],
})
export class ProducerModule {}
