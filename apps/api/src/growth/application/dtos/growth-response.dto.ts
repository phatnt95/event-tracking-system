import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType, GrowthResponse, LatestGrowthResponse } from '@baby-tracker/shared-types';

export class GrowthRecordResponseDto implements GrowthResponse {
  @ApiProperty({ example: 'growth-1' })
  id!: string;

  @ApiProperty({ example: 'event-1' })
  eventId!: string;

  @ApiProperty({ example: 'baby-1' })
  babyId!: string;

  @ApiProperty({ enum: EventType, example: EventType.GROWTH })
  type!: EventType;

  @ApiProperty({ example: 5.2 })
  weightKg!: number;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z' })
  occurredAt!: string;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z' })
  measuredAt!: string;

  @ApiProperty({ example: 8 })
  ageWeeks!: number;

  @ApiProperty({ example: 'Routine checkup weight' })
  note!: string;

  @ApiProperty({ example: 'user-1' })
  createdBy!: string;

  @ApiPropertyOptional({ example: 58.5 })
  heightCm?: number | null;

  @ApiPropertyOptional({ example: 38.0 })
  headCircumferenceCm?: number | null;

  @ApiPropertyOptional({ example: 'Dr. Smith' })
  measuredBy?: string | null;

  @ApiPropertyOptional({ example: 'City Hospital' })
  location?: string | null;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z' })
  updatedAt!: string;
}

export class LatestGrowthResponseDto implements LatestGrowthResponse {
  @ApiProperty({ example: 'growth-1' })
  id!: string;

  @ApiProperty({ example: 5.2 })
  weightKg!: number;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z' })
  measuredAt!: string;

  @ApiProperty({ example: 8 })
  ageWeeks!: number;
}
