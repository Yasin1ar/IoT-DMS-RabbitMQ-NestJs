/**
 * Test suite for the SignalsController.
 *
 * This suite verifies that the controller correctly delegates calls to the SignalService for:
 * - Retrieving multiple Xray records with filtering options.
 * - Fetching a single Xray record by deviceId.
 * - Creating a new Xray record from device-provided data.
 * - Deleting an Xray record by deviceId.
 *
 * A dummy Xray object is used to bypass missing properties and simulate real document behavior.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { SignalsController } from './signals.controller';
import { SignalService } from './signals.service';
import { GetXrayFilterDto } from './dto/get-xray-filter.dto';

// Create a dummy Xray object using a type cast to bypass missing internal properties.
const dummyXray = {
  _id: '6130b8b8f1e5c3d8fadead6c',
  deviceId: 'device123',
  dataLength: 10,
  dataVolume: 250,
  time: new Date('2023-01-01T00:00:00.000Z'),
} as any; // Casting as any to satisfy the Xray document interface

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
            getAllXrays: jest.fn(),
            getXrayByDeviceId: jest.fn(),
            processAndSaveXrayData: jest.fn(),
            deleteXray: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
    service = module.get<SignalService>(SignalService);
  });

  describe('getAllXrays', () => {
    it('should call SignalService.getAllXrays with the proper filter and return an array of Xray records', async () => {
      const filterDto: GetXrayFilterDto = {
        deviceId: 'device123',
        minDataLength: 5,
        maxDataLength: 20,
        minDataVolume: 100,
        maxDataVolume: 500,
        startTime: '2023-01-01T00:00:00.000Z',
        endTime: '2023-12-31T23:59:59.999Z',
      };

      const result = [dummyXray] as any;
      jest.spyOn(service, 'getAllXrays').mockResolvedValue(result);

      const response = await controller.getAllXrays(filterDto);
      expect(service.getAllXrays).toHaveBeenCalledWith(filterDto);
      expect(response).toEqual(result);
    });
  });

  describe('getXray', () => {
    it('should call SignalService.getXrayByDeviceId and return the Xray record', async () => {
      jest.spyOn(service, 'getXrayByDeviceId').mockResolvedValue(dummyXray);

      const response = await controller.getXray('device123');
      expect(service.getXrayByDeviceId).toHaveBeenCalledWith('device123');
      expect(response).toEqual(dummyXray);
    });
  });

  describe('createXray', () => {
    it('should call SignalService.processAndSaveXrayData with deviceId and data, then return the created record', async () => {
      const createDto = { deviceId: 'device123', data: [[1, [10, 20, 30]]] };

      // Mimic the created Xray record with additional properties.
      const createdXray = {
        ...dummyXray,
        dataLength: 1,
        dataVolume: 30,
        time: new Date(),
      };
      jest
        .spyOn(service, 'processAndSaveXrayData')
        .mockResolvedValue(createdXray);

      const response = await controller.createXray(createDto);
      expect(service.processAndSaveXrayData).toHaveBeenCalledWith(
        createDto.deviceId,
        createDto.data,
      );
      expect(response).toEqual(createdXray);
    });
  });

  describe('deleteXray', () => {
    it('should call SignalService.deleteXray with the given deviceId', async () => {
      jest.spyOn(service, 'deleteXray').mockResolvedValue(undefined);
      await controller.deleteXray('device123');
      expect(service.deleteXray).toHaveBeenCalledWith('device123');
    });
  });
});
