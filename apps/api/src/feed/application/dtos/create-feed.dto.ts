import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FeedType } from '@baby-tracker/shared-types';

export class CreateFeedDto {
  @ApiProperty({
    enum: FeedType,
    example: FeedType.FORMULA,
    description: 'Feed category type',
  })
  @IsEnum(FeedType)
  feedType!: FeedType;

  @ApiProperty({
    example: '2026-07-27T10:00:00.000Z',
    description: 'ISO timestamp when feed occurred',
  })
  @IsISO8601()
  occurredAt!: string;

  @ApiPropertyOptional({
    example: 'Baby drank formula smoothly.',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: 15,
    description: 'Left breast nursing duration in minutes',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leftDuration?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Right breast nursing duration in minutes',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rightDuration?: number;

  @ApiPropertyOptional({
    example: 150,
    description: 'Prepared volume in ml',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparedVolume?: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Consumed volume in ml',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consumedVolume?: number;

  @ApiPropertyOptional({
    example: 'Enfamil A+',
    description: 'Formula brand name',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 'Stage 1',
    description: 'Formula stage',
  })
  @IsOptional()
  @IsString()
  stage?: string;
}
