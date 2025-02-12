import { Schema, Document } from 'mongoose';

export interface Xray extends Document {
  deviceId: string;
  time: Date;
  dataLength: number;
  dataVolume: number;
}

export const XraySchema = new Schema<Xray>({
  deviceId: { type: String, required: true },
  time: { type: Date, required: true },
  dataLength: { type: Number, required: true },
  dataVolume: { type: Number, required: true },
});