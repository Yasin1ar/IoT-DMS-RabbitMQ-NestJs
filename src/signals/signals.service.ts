import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray } from './schemas/x-ray.schema';
import { GetXrayDto } from './dto/get-xray-filter.dto';
import { XrayDataEntry } from '../producer/iot.simulator.service';

@Injectable()
export class SignalService {
  constructor(@InjectModel('Xray') private xrayModel: Model<Xray>) {}

  async processAndSaveXrayData(
    deviceId: string,
    data: XrayDataEntry[],
  ): Promise<Xray> {
    if (!Array.isArray(data)) {
      throw new BadRequestException('Invalid x-ray data format');
    }

    const dataLength = data.length;
    const dataVolume = data.reduce((sum, entry) => sum + entry.values[2], 0);

    const xrayDocument = new this.xrayModel({
      deviceId,
      time: new Date(),
      dataLength,
      dataVolume,
    });

    return xrayDocument.save();
  }

  async getAllXrays(
    filterDto: GetXrayDto,
  ): Promise<{ data: Xray[]; total: number }> {
    const {
      deviceId,
      minDataLength,
      maxDataLength,
      minDataVolume,
      maxDataVolume,
      startTime,
      endTime,
      page = 1,
      limit = 10,
    } = filterDto;

    const query: any = {};

    if (deviceId) {
      query.deviceId = deviceId;
    }

    if (minDataLength !== undefined || maxDataLength !== undefined) {
      query.dataLength = {};
      if (minDataLength !== undefined) {
        query.dataLength.$gte = minDataLength;
      }
      if (maxDataLength !== undefined) {
        query.dataLength.$lte = maxDataLength;
      }
    }

    if (minDataVolume !== undefined || maxDataVolume !== undefined) {
      query.dataVolume = {};
      if (minDataVolume !== undefined) {
        query.dataVolume.$gte = minDataVolume;
      }
      if (maxDataVolume !== undefined) {
        query.dataVolume.$lte = maxDataVolume;
      }
    }

    if (startTime || endTime) {
      query.time = {};
      if (startTime) {
        const parsedStart = new Date(startTime);
        if (!isNaN(parsedStart.getTime())) {
          query.time.$gte = parsedStart;
        }
      }
      if (endTime) {
        const parsedEnd = new Date(endTime);
        if (!isNaN(parsedEnd.getTime())) {
          query.time.$lte = parsedEnd;
        }
      }
      if (Object.keys(query.time).length === 0) {
        delete query.time;
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.xrayModel.find(query).skip(skip).limit(limit).exec(),
      this.xrayModel.countDocuments(query).exec(),
    ]);
    return { data, total };
  }

  async getXrayByDeviceId(deviceId: string): Promise<Xray> {
    const xray = await this.xrayModel.findOne({ deviceId }).exec();
    if (!xray) {
      throw new NotFoundException(
        `X-ray record with deviceId ${deviceId} not found`,
      );
    }
    return xray;
  }

  async deleteXray(deviceId: string): Promise<void> {
    const result = await this.xrayModel.deleteOne({ deviceId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `X-ray record with deviceId ${deviceId} not found`,
      );
    }
  }
}
