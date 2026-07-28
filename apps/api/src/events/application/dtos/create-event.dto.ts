import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@baby-tracker/shared-types';

export class CreateEventDto {
  @ApiProperty({
    enum: EventType,
    example: EventType.SLEEP,
    description: 'Type of the baby event',
  })
  @IsEnum(EventType, { message: 'type must be a valid EventType' })
  type!: EventType;

  @ApiProperty({
    example: '2026-07-27T08:00:00.000Z',
    description: 'When the event occurred (ISO 8601)',
  })
  @IsDateString({}, { message: 'occurredAt must be a valid ISO date string' })
  occurredAt!: string;

  @ApiProperty({
    example: 'Baby slept through the night.',
    description: 'Optional note about the event',
    required: false,
    default: '',
  })
  @IsString()
  @IsOptional()
  note?: string;
}
