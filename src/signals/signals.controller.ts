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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  getSchemaPath,
  ApiQuery,
} from '@nestjs/swagger';
import { SignalService } from './signals.service';
import { Xray as XrayModel } from './schemas/x-ray.schema';
import { GetXrayDto } from './dto/get-xray-filter.dto';
import { CreateXrayDto } from './dto/create-xray.dto';

@ApiTags('signals')
@Controller('signals')
export class SignalsController {
  constructor(private readonly signalService: SignalService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all x-ray records with pagination and filtering',
    description:
      'Retrieve all x-ray records, optionally filtered by deviceId, data length, data volume, or time range. Supports pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of x-ray records',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(XrayModel) } },
        total: { type: 'number' },
      },
    },
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    example: 1,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    example: 10,
    required: false,
    description: 'Limit number of records per page',
  })
  async getAllXrays(
    @Query() filterAndPagination: GetXrayDto,
  ): Promise<{ data: XrayModel[]; total: number }> {
    return this.signalService.getAllXrays(filterAndPagination);
  }

  @Get(':deviceId')
  @ApiOperation({
    summary: 'Get x-ray record by deviceId',
    description: 'Retrieve a single x-ray record by deviceId.',
  })
  @ApiParam({ name: 'deviceId', description: 'The device ID to look up' })
  @ApiResponse({ status: 200, description: 'X-ray record', type: XrayModel })
  @ApiResponse({ status: 404, description: 'X-ray record not found' })
  async getXray(@Param('deviceId') deviceId: string): Promise<XrayModel> {
    return this.signalService.getXrayByDeviceId(deviceId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new x-ray record',
    description: 'Create and store a new x-ray record for a device.',
  })
  @ApiBody({ type: CreateXrayDto })
  @ApiResponse({
    status: 201,
    description: 'X-ray record created',
    type: XrayModel,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createXray(@Body() body: CreateXrayDto): Promise<XrayModel> {
    return this.signalService.processAndSaveXrayData(body.deviceId, body.data);
  }

  @Delete(':deviceId')
  @ApiOperation({
    summary: 'Delete x-ray record by deviceId',
    description: 'Delete a single x-ray record by deviceId.',
  })
  @ApiParam({ name: 'deviceId', description: 'The device ID to delete' })
  @ApiResponse({ status: 204, description: 'X-ray record deleted' })
  @ApiResponse({ status: 404, description: 'X-ray record not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteXray(@Param('deviceId') deviceId: string): Promise<void> {
    await this.signalService.deleteXray(deviceId);
  }
}
