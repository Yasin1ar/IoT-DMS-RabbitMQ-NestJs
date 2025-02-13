/**
 * Module for managing X-ray signals.
 *
 * Registers the X-ray schema with the database, configures the controller for HTTP requests,
 * and provides the service responsible for processing and business logic related to X-ray data.
 * Exports the service for consumption in other parts of the application.
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SignalService } from './signals.service';
import { SignalsController } from './signals.controller';
import { XraySchema } from './schemas/x-ray.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Xray', schema: XraySchema }])],
  controllers: [SignalsController],
  providers: [SignalService],
  exports: [SignalService],
})
export class SignalsModule {}
