/**
 * Test suite for FakeXrayModel and SignalService query filtering functionality.
 *
 * This file includes existing tests for the FakeXrayModel as well as new tests
 * for verifying that SignalService builds the correct query conditions when filtering.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SignalService } from './signals.service';
import { GetXrayFilterDto } from './dto/get-xray-filter.dto';

class FakeXrayModel {
  data: any;
  constructor(data: any) {
    this.data = data;
  }

  save() {
    return Promise.resolve(this.data);
  }

  static findMock: (() => any) | undefined;
  static findOneMock: ((query: any) => any) | undefined;
  static deleteOneMock: ((query: any) => any) | undefined;

  static find() {
    return {
      exec: () =>
        Promise.resolve(FakeXrayModel.findMock ? FakeXrayModel.findMock() : []),
    };
  }

  static findOne(query: any) {
    return {
      exec: () =>
        Promise.resolve(
          FakeXrayModel.findOneMock ? FakeXrayModel.findOneMock(query) : null,
        ),
    };
  }

  static create(data: any) {
    return Promise.resolve(data);
  }

  static deleteOne(query: any) {
    return {
      exec: () =>
        Promise.resolve(
          FakeXrayModel.deleteOneMock
            ? FakeXrayModel.deleteOneMock(query)
            : { deletedCount: 1 },
        ),
    };
  }
}

describe('FakeXrayModel', () => {
  afterEach(() => {
    FakeXrayModel.findMock = undefined;
    FakeXrayModel.findOneMock = undefined;
    FakeXrayModel.deleteOneMock = undefined;
  });

  it('should return an empty array when no findMock is set', async () => {
    const result = await FakeXrayModel.find().exec();
    expect(result).toEqual([]);
  });

  it('should return expected object when findOneMock is set', async () => {
    FakeXrayModel.findOneMock = (query: any) =>
      query.deviceId === 'test' ? { deviceId: 'test' } : null;
    const result = await FakeXrayModel.findOne({ deviceId: 'test' }).exec();
    expect(result).toEqual({ deviceId: 'test' });
  });
});

//
// =================== SignalService Query Filtering Tests ===================
//
describe('SignalService Query Filtering', () => {
  let service: SignalService;
  let mockXrayModel: any;

  beforeEach(async () => {
    // Create a mock for the xrayModel with a 'find' method.
    mockXrayModel = {
      find: jest.fn().mockImplementation((query) => ({
        exec: jest.fn().mockResolvedValue(query), // Returns the query object to inspect filters.
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalService,
        {
          provide: getModelToken('Xray'),
          useValue: mockXrayModel,
        },
      ],
    }).compile();

    service = module.get<SignalService>(SignalService);
  });

  it('should build a query with deviceId filter', async () => {
    const dto: GetXrayFilterDto = { deviceId: 'device123' };

    const queryResult = await service.getAllXrays(dto);

    expect(mockXrayModel.find).toHaveBeenCalledWith({ deviceId: 'device123' });
    expect(queryResult).toMatchObject({ deviceId: 'device123' });
  });

  it('should build a query with data length and volume filters', async () => {
    const dto: GetXrayFilterDto = {
      minDataLength: 5,
      maxDataLength: 20,
      minDataVolume: 100,
      maxDataVolume: 500,
    };

    const queryResult = await service.getAllXrays(dto);

    expect(mockXrayModel.find).toHaveBeenCalledWith({
      dataLength: { $gte: 5, $lte: 20 },
      dataVolume: { $gte: 100, $lte: 500 },
    });
    expect(queryResult).toMatchObject({
      dataLength: { $gte: 5, $lte: 20 },
      dataVolume: { $gte: 100, $lte: 500 },
    });
  });

  it('should build a query with time range filters', async () => {
    const startTime = '2023-01-01T00:00:00.000Z';
    const endTime = '2023-12-31T23:59:59.999Z';
    const dto: GetXrayFilterDto = { startTime, endTime };

    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    const queryResult = await service.getAllXrays(dto);

    expect(mockXrayModel.find).toHaveBeenCalledWith({
      time: { $gte: parsedStart, $lte: parsedEnd },
    });
    expect(queryResult).toMatchObject({
      time: { $gte: parsedStart, $lte: parsedEnd },
    });
  });

  it('should combine multiple filters', async () => {
    const dto: GetXrayFilterDto = {
      deviceId: 'device123',
      minDataLength: 5,
      maxDataLength: 15,
      minDataVolume: 50,
      startTime: '2023-05-01T00:00:00.000Z',
    };

    const parsedStart = new Date(dto.startTime as string);

    const queryResult = await service.getAllXrays(dto);

    expect(mockXrayModel.find).toHaveBeenCalledWith({
      deviceId: 'device123',
      dataLength: { $gte: 5, $lte: 15 },
      dataVolume: { $gte: 50 },
      time: { $gte: parsedStart },
    });
    expect(queryResult).toMatchObject({
      deviceId: 'device123',
      dataLength: { $gte: 5, $lte: 15 },
      dataVolume: { $gte: 50 },
      time: { $gte: parsedStart },
    });
  });
});
