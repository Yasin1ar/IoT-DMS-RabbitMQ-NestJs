import { Controller, Get, Param, Delete, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SignalService } from './signals.service';
import { Xray } from './schemas/x-ray.schema';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalService: SignalService) {}

  @Get()
  async getAllXrays(): Promise<Xray[]> {
    return this.signalService.getAllXrays();
  }

  @Get(':deviceId')
  async getXray(@Param('deviceId') deviceId: string): Promise<Xray> {
    return this.signalService.getXrayByDeviceId(deviceId);
  }

  @Post()
  async createXray(@Body() body: { deviceId: string; data: any[] }): Promise<Xray> {
    return this.signalService.processAndSaveXrayData(body.deviceId, body.data);
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT) // ✅ Now returning 204 No Content
  async deleteXray(@Param('deviceId') deviceId: string): Promise<void> {
    await this.signalService.deleteXray(deviceId);
  }
}
