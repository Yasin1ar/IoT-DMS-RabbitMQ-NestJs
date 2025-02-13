/**
 * Provides services for processing and managing X-ray data.
 *
 * This service validates, processes, and persists X-ray data received from various devices. 
 * It offers methods to save new X-ray records, retrieve all records, retrieve a record by device ID, 
 * and delete a record by device ID. In case of invalid data formats or missing records, 
 * appropriate exceptions are thrown.
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray } from './schemas/x-ray.schema';

@Injectable()
export class SignalService {
  constructor(@InjectModel('Xray') private xrayModel: Model<Xray>) {}

  async processAndSaveXrayData(deviceId: string, data: any[]): Promise<Xray> {
    if (!Array.isArray(data)) {
      throw new BadRequestException('Invalid x-ray data format');
    }

    const dataLength = data.length;
    const dataVolume = data.reduce((sum, entry) => sum + entry[1][2], 0);

    const xrayDocument = new this.xrayModel({
      deviceId,
      time: new Date(),
      dataLength,
      dataVolume,
    });

    return xrayDocument.save();
  }

  async getAllXrays(): Promise<Xray[]> {
    return this.xrayModel.find().exec();
  }

  async getXrayByDeviceId(deviceId: string): Promise<Xray> {
    const xray = await this.xrayModel.findOne({ deviceId }).exec();
    if (!xray) {
      throw new NotFoundException(`X-ray record with deviceId ${deviceId} not found`);
    }
    return xray;
  }

  async deleteXray(deviceId: string): Promise<void> {
    const result = await this.xrayModel.deleteOne({ deviceId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`X-ray record with deviceId ${deviceId} not found`);
    }
  }
}
