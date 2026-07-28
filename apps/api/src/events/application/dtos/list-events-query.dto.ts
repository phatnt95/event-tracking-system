import {
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  IsString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EventType } from '@baby-tracker/shared-types';

export class ListEventsQueryDto {
  @ApiPropertyOptional({
    enum: EventType,
    description: 'Filter by event type',
    required: false,
  })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiPropertyOptional({
    example: '2026-07-01T00:00:00.000Z',
    description: 'Start of the date range (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31T23:59:59.000Z',
    description: 'End of the date range (ISO 8601)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    example: 20,
    description: 'Maximum number of events to return (1–100, default: 20)',
    required: false,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Event ID cursor returned by the previous timeline page' })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive search in event notes' })
  @IsOptional()
  @IsString()
  search?: string;
}
