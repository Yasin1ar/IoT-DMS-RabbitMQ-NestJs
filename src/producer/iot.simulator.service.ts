import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

export interface XrayDataEntry {
  index: number;
  values: [number, number, number];
}

@Injectable()
export class IotSimulatorService implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timeout;

  constructor(private readonly rabbitMQProducer: RabbitMQProducerService) {}

  onModuleInit() {
    this.startSimulation();
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startSimulation() {
    this.intervalId = setInterval(() => {
      const deviceId = `device-${Math.floor(Math.random() * 1000)}`;
      const data = this.generateXrayData();
      this.rabbitMQProducer.sendXrayData(deviceId, data);
    }, 5000);
  }

  private generateXrayData(): XrayDataEntry[] {
    return Array.from(
      { length: Math.floor(Math.random() * 10) + 1 },
      (_, index) => ({
        index: index + 1,
        values: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
      }),
    );
  }
}
