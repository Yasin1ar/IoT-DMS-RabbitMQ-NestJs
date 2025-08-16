import { Test, TestingModule } from '@nestjs/testing';
import { SignalService } from './signals.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockSave = jest.fn();
const mockXrayModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
};
const mockXrayModelConstructor = jest.fn(() => ({ save: mockSave }));
Object.assign(mockXrayModelConstructor, mockXrayModel);

describe('SignalService', () => {
  let service: SignalService;
  let xrayModel: any;

  beforeEach(async () => {
    mockSave.mockReset();
    mockXrayModelConstructor.mockClear();
    mockXrayModel.find.mockReset();
    mockXrayModel.findOne.mockReset();
    mockXrayModel.deleteOne.mockReset();
    mockXrayModel.countDocuments.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalService,
        {
          provide: getModelToken('Xray'),
          useValue: mockXrayModelConstructor,
        },
      ],
    }).compile();

    service = module.get<SignalService>(SignalService);
    xrayModel = module.get(getModelToken('Xray'));
  });

  describe('processAndSaveXrayData', () => {
    it('should throw BadRequestException if data is not array', async () => {
      await expect(
        service.processAndSaveXrayData('dev1', null!),
      ).rejects.toThrow(BadRequestException);
    });
    it('should save and return xray document', async () => {
      mockSave.mockResolvedValue('savedXray');
      const result = await service.processAndSaveXrayData('dev1', [
        { index: 1, values: [1, 2, 3] },
      ]);
      expect(mockXrayModelConstructor).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBe('savedXray');
    });
  });

  describe('getAllXrays', () => {
    it('should return data and total', async () => {
      xrayModel.find.mockReturnValue({
        skip: () => ({
          limit: () => ({ exec: jest.fn().mockResolvedValue([1, 2]) }),
        }),
      });
      xrayModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });
      const result = await service.getAllXrays({ page: 1, limit: 10 });
      expect(result).toEqual({ data: [1, 2], total: 2 });
    });
  });

  describe('getXrayByDeviceId', () => {
    it('should throw NotFoundException if not found', async () => {
      xrayModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.getXrayByDeviceId('dev1')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should return xray if found', async () => {
      xrayModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue('xray'),
      });
      const result = await service.getXrayByDeviceId('dev1');
      expect(result).toBe('xray');
    });
  });

  describe('deleteXray', () => {
    it('should throw NotFoundException if nothing deleted', async () => {
      xrayModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });
      await expect(service.deleteXray('dev1')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should not throw if deleted', async () => {
      xrayModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      await expect(service.deleteXray('dev1')).resolves.toBeUndefined();
    });
  });
});
