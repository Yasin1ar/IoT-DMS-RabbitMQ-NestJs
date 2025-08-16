import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetXrayDto {
  @ApiProperty({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ description: 'Limit number of records per page' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filter by device ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Minimum data length' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minDataLength?: number;

  @ApiPropertyOptional({ description: 'Maximum data length' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDataLength?: number;

  @ApiPropertyOptional({ description: 'Minimum data volume' })
  @IsOptional()
  @IsNumber()
  minDataVolume?: number;

  @ApiPropertyOptional({ description: 'Maximum data volume' })
  @IsOptional()
  @IsNumber()
  maxDataVolume?: number;

  @ApiPropertyOptional({ description: 'Start time (ISO 8601 string)' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (ISO 8601 string)' })
  @IsOptional()
  @IsDateString()
  endTime?: string;
}
