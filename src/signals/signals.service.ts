/**
 * Provides services for processing and managing X-ray data.
 *
 * This service validates, processes, and persists X-ray data received from various devices.
 * It offers methods to:
 * - Save new X-ray records.
 * - Retrieve all records (with optional filtering).
 * - Retrieve a record by device ID.
 * - Delete a record by device ID.
 *
 * In case of invalid data formats or missing records, appropriate exceptions are thrown.
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray } from './schemas/x-ray.schema';
import { GetXrayFilterDto } from './dto/get-xray-filter.dto';

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

  /**
   * Retrieves X-ray records with optional filtering.
   *
   * Supports filtering by:
   * - deviceId: for a specific device.
   * - minDataLength & maxDataLength: to filter by x-ray data size.
   * - minDataVolume & maxDataVolume: to filter by total data volume.
   * - startTime & endTime: to restrict records to a time range.
   *
   * @param filterDto Object containing the filtering options
   * @returns Promise resolving to an array of matching X-ray documents.
   */
  async getAllXrays(filterDto: GetXrayFilterDto): Promise<Xray[]> {
    const {
      deviceId,
      minDataLength,
      maxDataLength,
      minDataVolume,
      maxDataVolume,
      startTime,
      endTime,
    } = filterDto;

    // Build query conditions based on filter parameters
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

    return this.xrayModel.find(query).exec();
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
