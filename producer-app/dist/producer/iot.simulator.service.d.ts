import { OnModuleInit } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
export declare class IotSimulatorService implements OnModuleInit {
    private readonly rabbitMQProducer;
    constructor(rabbitMQProducer: RabbitMQProducerService);
    onModuleInit(): void;
    private startSimulation;
    private generateXrayData;
}
