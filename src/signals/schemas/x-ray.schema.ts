/**
 * Defines the Xray interface and schema for Mongoose.
 *
 * The interface extends the Mongoose Document interface and defines the structure
 * for Xray documents, including deviceId, time, dataLength, and dataVolume.
 * The schema defines the data types and validation rules for each field.
 */
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
