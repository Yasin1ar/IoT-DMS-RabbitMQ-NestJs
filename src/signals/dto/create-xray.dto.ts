import {
  IsString,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  IsInt,
  Min,
  IsNumber,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class XrayDataEntryDto {
  @ApiProperty({ description: 'Index of the data entry (starts from 1)' })
  @IsInt()
  @Min(1)
  index: number;

  @ApiProperty({
    description: 'Array of three numeric values',
    type: [Number],
    minItems: 3,
    maxItems: 3,
  })
  @IsArray()
  @Length(3, 3)
  @IsNumber({}, { each: true })
  values: [number, number, number];
}

export class CreateXrayDto {
  @ApiProperty({ description: 'Device ID for the x-ray record' })
  @IsString()
  deviceId: string;

  @ApiProperty({
    description: 'Array of x-ray data entries',
    type: [XrayDataEntryDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => XrayDataEntryDto)
  data: XrayDataEntryDto[];
}
