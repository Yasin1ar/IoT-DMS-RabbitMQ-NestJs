import { Test, TestingModule } from '@nestjs/testing';
import { SignalsController } from './signals.controller';
import { SignalService } from './signals.service';

describe('SignalsController', () => {
  let controller: SignalsController;
  let service: SignalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignalsController],
      providers: [
        {
          provide: SignalService,
          useValue: {
            getAllXrays: jest.fn().mockResolvedValue([{ deviceId: '123' }]),
            processAndSaveXrayData: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
    service = module.get<SignalService>(SignalService);
  });

  it('should return all x-ray records', async () => {
    expect(await controller.getAllXrays()).toEqual([{ deviceId: '123' }]);
  });
});
