import { Module } from '@nestjs/common';
import { SignalsGateway } from './signals.gateway';

@Module({
  providers: [SignalsGateway],
  exports: [SignalsGateway],
})
export class RealtimeModule {}
