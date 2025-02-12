import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalsService } from './signals.service';
import { XraySchema } from './schemas/x-ray.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'XRay', schema: XraySchema }]),
  ],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}