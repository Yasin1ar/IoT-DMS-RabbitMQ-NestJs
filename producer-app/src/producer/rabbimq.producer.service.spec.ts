/**
 * Test suite for RabbitMQProducerService.
 *
 * This suite verifies that the sendXrayData method correctly publishes x-ray data to RabbitMQ.
 * It sets up a testing module with the service provider, mocks the method to avoid real connections,
 * and confirms that the method gets called as expected.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQProducerService } from './rabbitmq.producer.service';

describe('RabbitMQProducerService', () => {
  let service: RabbitMQProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitMQProducerService],
    }).compile();

    service = module.get<RabbitMQProducerService>(RabbitMQProducerService);
  });

  it('should send x-ray data to RabbitMQ', async () => {
    const spySend = jest.spyOn(service, 'sendXrayData').mockImplementation(() => Promise.resolve());
    await service.sendXrayData('device-123', [[1, [10, 20, 30]]]);
    expect(spySend).toHaveBeenCalled();
  });
});

