import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalService } from './signals.service';
import { SignalsController } from './signals.controller';
import { XraySchema } from './schemas/x-ray.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Xray', schema: XraySchema }]),
    RealtimeModule,
  ],
  controllers: [SignalsController],
  providers: [SignalService],
  exports: [SignalService],
})
export class SignalsModule {}
