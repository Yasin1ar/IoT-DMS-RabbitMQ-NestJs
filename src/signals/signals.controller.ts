/**
 * Controller for managing Xray signals.
 *
 * Exposes endpoints to:
 * - Retrieve all Xray records with optional filtering.
 * - Fetch a specific record by device ID.
 * - Create a new Xray entry from device data.
 * - Delete an Xray record.
 *
 * Utilizes the SignalService to process and persist data.
 */
import {
  Controller,
  Get,
  Param,
  Delete,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SignalService } from './signals.service';
import { Xray } from './schemas/x-ray.schema';
import { GetXrayFilterDto } from './dto/get-xray-filter.dto';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalService: SignalService) {}

  @Get()
  async getAllXrays(@Query() filterDto: GetXrayFilterDto): Promise<Xray[]> {
    // Pass filtering options to the service layer.
    return this.signalService.getAllXrays(filterDto);
  }

  @Get(':deviceId')
  async getXray(@Param('deviceId') deviceId: string): Promise<Xray> {
    return this.signalService.getXrayByDeviceId(deviceId);
  }

  @Post()
  async createXray(
    @Body() body: { deviceId: string; data: any[] },
  ): Promise<Xray> {
    return this.signalService.processAndSaveXrayData(body.deviceId, body.data);
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteXray(@Param('deviceId') deviceId: string): Promise<void> {
    await this.signalService.deleteXray(deviceId);
  }
}
