import { Schema, Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class Xray {
  @ApiProperty({ description: 'Device ID', example: 'device-123' })
  deviceId: string;

  @ApiProperty({
    description: 'Timestamp of the x-ray record',
    example: '2024-05-01T12:00:00.000Z',
  })
  time: Date;

  @ApiProperty({
    description: 'Number of data entries in the x-ray',
    example: 5,
  })
  dataLength: number;

  @ApiProperty({
    description: 'Total data volume (sum of third value in each entry)',
    example: 250.5,
  })
  dataVolume: number;
}

export interface XrayDocument extends Document, Xray {}

export const XraySchema = new Schema<XrayDocument>(
  {
    deviceId: { type: String, required: true },
    time: { type: Date, required: true },
    dataLength: { type: Number, required: true },
    dataVolume: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

XraySchema.index({ time: 1 });
XraySchema.index({ deviceId: 1, time: 1 });
