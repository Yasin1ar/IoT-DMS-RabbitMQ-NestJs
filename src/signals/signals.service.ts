import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Xray } from './schemas/x-ray.schema';

@Injectable()
export class SignalsService {
  constructor(@InjectModel('Xray') private xrayModel: Model<Xray>) {}

  async processAndSaveXrayData(deviceId: string, data: any[]): Promise<void> {
    const dataLength = data.length;
    const dataVolume = data.reduce((sum, entry) => sum + entry[1][2], 0);

    const xrayDocument = new this.xrayModel({
      deviceId,
      time: new Date(),
      dataLength,
      dataVolume,
    });
    await xrayDocument.save();
  }
}