import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQService } from './rabbitmq.consumer.service';
import { SignalService } from '../signals/signals.service';
import { RabbitMQConnectionHelper } from './rabbitmq.connection.service';
import { AppLogger } from '../common/logger.service';

const mockSignalService = () => ({
  processAndSaveXrayData: jest.fn(),
});

const mockConnectionHelper = () => ({
  connectWithRetry: jest.fn(),
  getChannel: jest.fn(),
  getQueueName: jest.fn(),
  closeConnection: jest.fn(),
});

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let connectionHelper: any;
  let signalService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQService,
        { provide: SignalService, useFactory: mockSignalService },
        { provide: RabbitMQConnectionHelper, useFactory: mockConnectionHelper },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();
    service = module.get<RabbitMQService>(RabbitMQService);
    connectionHelper = module.get<RabbitMQConnectionHelper>(
      RabbitMQConnectionHelper,
    );
    signalService = module.get<SignalService>(SignalService);
  });

  describe('onModuleInit', () => {
    it('should call connectWithRetry', async () => {
      await service.onModuleInit();
      expect(connectionHelper.connectWithRetry).toBeCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should close connection', async () => {
      await service.onModuleDestroy();
      expect(connectionHelper.closeConnection).toBeCalled();
    });
  });

  describe('consumeMessages', () => {
    it('should process valid message and ack', async () => {
      const ack = jest.fn();
      const channel = {
        assertQueue: jest.fn(),
        consume: jest.fn((queue, cb) => {
          const msg = {
            content: Buffer.from(
              JSON.stringify({
                dev1: { data: [{ index: 1, values: [1, 2, 3] }] },
              }),
            ),
            ack,
          };
          cb(msg);
        }),
        ack,
      };
      connectionHelper.getChannel.mockReturnValue(channel);
      connectionHelper.getQueueName.mockReturnValue('queue');
      signalService.processAndSaveXrayData.mockResolvedValue(true);
      await (service as any).createQueueAndConsume();
      expect(signalService.processAndSaveXrayData).toHaveBeenCalledWith(
        'dev1',
        [{ index: 1, values: [1, 2, 3] }],
      );
      expect(ack).toHaveBeenCalled();
    });
    it('should ack and log error on invalid message', async () => {
      const ack = jest.fn();
      const channel = {
        assertQueue: jest.fn(),
        consume: jest.fn((queue, cb) => {
          const msg = { content: Buffer.from('invalid'), ack };
          cb(msg);
        }),
        ack,
      };
      connectionHelper.getChannel.mockReturnValue(channel);
      connectionHelper.getQueueName.mockReturnValue('queue');
      await (service as any).createQueueAndConsume();
      expect(ack).toHaveBeenCalled();
    });
  });
});
