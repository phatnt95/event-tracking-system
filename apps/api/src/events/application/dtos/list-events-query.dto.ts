import { IsEnum, IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EventType } from '@baby-tracker/shared-types';

export class ListEventsQueryDto {
  @ApiProperty({
    enum: EventType,
    description: 'Filter by event type',
    required: false,
  })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiProperty({
    example: '2026-07-01T00:00:00.000Z',
    description: 'Start of the date range (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiProperty({
    example: '2026-07-31T23:59:59.000Z',
    description: 'End of the date range (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiProperty({
    example: 50,
    description: 'Maximum number of events to return (1–200, default: 50)',
    required: false,
    default: 50,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  limit?: number;
}
