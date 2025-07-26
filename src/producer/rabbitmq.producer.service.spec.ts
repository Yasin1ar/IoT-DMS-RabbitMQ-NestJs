import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQProducerService } from './rabbitmq.producer.service';
import { ConfigService } from '@nestjs/config';
import { RabbitMQConnectionHelper } from '../rabbitmq/rabbitmq.connection.service';
import { AppLogger } from '../common/logger.service';

const mockConnectionHelper = () => ({
  connectWithRetry: jest.fn(),
  getChannel: jest.fn(),
  getQueueName: jest.fn(),
  closeConnection: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('RabbitMQProducerService', () => {
  let service: RabbitMQProducerService;
  let connectionHelper: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQProducerService,
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: RabbitMQConnectionHelper, useFactory: mockConnectionHelper },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<RabbitMQProducerService>(RabbitMQProducerService);
    connectionHelper = module.get<RabbitMQConnectionHelper>(
      RabbitMQConnectionHelper,
    );
  });

  describe('onModuleInit', () => {
    it('should call connectWithRetry', async () => {
      await service.onModuleInit();
      expect(connectionHelper.connectWithRetry).toHaveBeenCalled();
    });
  });

  describe('sendXrayData', () => {
    it('should send message and return true', async () => {
      const channel = { sendToQueue: jest.fn().mockReturnValue(true) };
      connectionHelper.getChannel.mockReturnValue(channel);
      connectionHelper.getQueueName.mockReturnValue('queue');
      const result = await service.sendXrayData('dev1', [
        { index: 1, values: [1, 2, 3] },
      ]);
      expect(channel.sendToQueue).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    it('should reconnect and return false on error', async () => {
      connectionHelper.getChannel.mockImplementation(() => {
        throw new Error('fail');
      });
      const result = await service.sendXrayData('dev1', [
        { index: 1, values: [1, 2, 3] },
      ]);
      expect(connectionHelper.connectWithRetry).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close connection', async () => {
      await service.onModuleDestroy();
      expect(connectionHelper.closeConnection).toHaveBeenCalled();
    });
  });
});
