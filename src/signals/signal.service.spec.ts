import { Test, TestingModule } from '@nestjs/testing';
import { SignalService } from './signals.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray } from './schemas/x-ray.schema';

describe('SignalService', () => {
  let service: SignalService;
  let model: Model<Xray>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalService,
        {
          provide: getModelToken('Xray'),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ deviceId: '123' }),
          },
        },
      ],
    }).compile();

    service = module.get<SignalService>(SignalService);
    model = module.get<Model<Xray>>(getModelToken('Xray'));
  });

  it('should return all x-ray records', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ deviceId: '123' }]),
    } as any);
    expect(await service.getAllXrays()).toEqual([{ deviceId: '123' }]);
  });

  it('should save x-ray data', async () => {
    const spyCreate = jest.spyOn(model, 'create');
    await service.processAndSaveXrayData('123', [[1, [10, 20, 30]]]);
    expect(spyCreate).toHaveBeenCalled();
  });
});
