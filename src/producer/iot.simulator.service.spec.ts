import { Test, TestingModule } from '@nestjs/testing';
import { IotSimulatorService } from './iot.simulator.service';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

const mockProducerService = () => ({
  sendXrayData: jest.fn(),
});

describe('IotSimulatorService', () => {
  let service: IotSimulatorService;
  let producer: any;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IotSimulatorService,
        { provide: RabbitMQProducerService, useFactory: mockProducerService },
      ],
    }).compile();
    service = module.get<IotSimulatorService>(IotSimulatorService);
    producer = module.get<RabbitMQProducerService>(RabbitMQProducerService);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should start simulation on init and call sendXrayData', () => {
    const spy = jest.spyOn<any, any>(service, 'generateXrayData');
    service.onModuleInit();
    jest.advanceTimersByTime(5000);
    expect(producer.sendXrayData).toBeCalled();
    expect(spy).toBeCalled();
  });

  it('should clear interval on destroy', () => {
    service.onModuleInit();
    const clearSpy = jest.spyOn(global, 'clearInterval');
    service.onModuleDestroy();
    expect(clearSpy).toBeCalled();
  });

  it('generateXrayData should return array of XrayDataEntry', () => {
    const data = (service as any).generateXrayData();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('index');
      expect(data[0]).toHaveProperty('values');
    }
  });
});
