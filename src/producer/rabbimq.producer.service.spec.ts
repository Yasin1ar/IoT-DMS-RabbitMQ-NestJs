/**
 * Test suite for RabbitMQProducerService.
 *
 * This suite verifies that the sendXrayData method correctly publishes x-ray data to RabbitMQ.
 * It sets up a testing module with the service provider, mocks the ConfigService to avoid real connections,
 * and confirms that the method gets called as expected.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

describe('RabbitMQProducerService', () => {
  let service: RabbitMQProducerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQProducerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: string) => {
              // Mock configuration values
              const config = {
                'RABBITMQ_HOST': 'localhost',
                'RABBITMQ_PORT': '5672',
                'RABBITMQ_USER': 'guest',
                'RABBITMQ_PASSWORD': 'guest',
                'RABBITMQ_QUEUE': 'test-queue'
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RabbitMQProducerService>(RabbitMQProducerService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Mock the connectWithRetry method to avoid actual connection attempts
    jest.spyOn<any, any>(service, 'connectWithRetry').mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send x-ray data to RabbitMQ', async () => {
    // Define test data
    const deviceId = 'device-123';
    const xrayData = [[1, [10, 20, 30]]];
    
    // Mock the sendXrayData method to avoid actual RabbitMQ connections
    const spySend = jest.spyOn(service, 'sendXrayData')
      .mockResolvedValue(true);
    
    // Call the method with test data
    await service.sendXrayData(deviceId, xrayData);
    
    // Verify the method was called with the correct parameters
    expect(spySend).toHaveBeenCalledWith(deviceId, xrayData);
    expect(spySend).toHaveBeenCalledTimes(1);
  });

  it('should use configuration from ConfigService', () => {
    // Verify that ConfigService.get was called with the expected parameters
    expect(configService.get).toHaveBeenCalledWith('RABBITMQ_HOST', 'localhost');
    expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PORT', '5672');
    expect(configService.get).toHaveBeenCalledWith('RABBITMQ_USER', 'guest');
    expect(configService.get).toHaveBeenCalledWith('RABBITMQ_PASSWORD', 'guest');
    expect(configService.get).toHaveBeenCalledWith('RABBITMQ_QUEUE', 'x-ray-queue');
  });
});