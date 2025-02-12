import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

@Injectable()
export class IotSimulatorService implements OnModuleInit {
  constructor(private readonly rabbitMQProducer: RabbitMQProducerService) {}

  onModuleInit() {
    this.startSimulation();
  }

  private startSimulation() {
    setInterval(() => {
      const deviceId = `device-${Math.floor(Math.random() * 1000)}`;
      const data = this.generateXrayData();
      this.rabbitMQProducer.sendXrayData(deviceId, data);
    }, 5000); // Send data every 5 seconds
  }

  private generateXrayData(): any[] {
    return Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, index) => [
      index + 1,
      [Math.random() * 100, Math.random() * 100, Math.random() * 100],
    ]);
  }
}
