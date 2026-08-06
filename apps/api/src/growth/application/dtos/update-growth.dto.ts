import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateGrowthDto {
  @ApiPropertyOptional({ example: 5.4, description: 'Weight in kg (must be > 0)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  weightKg?: number;

  @ApiPropertyOptional({
    example: '2026-08-01T08:00:00.000Z',
    description: 'Measurement date/time',
  })
  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @ApiPropertyOptional({ example: 'Updated notes', description: 'Notes' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 59.0, description: 'Height in cm (optional)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  heightCm?: number;

  @ApiPropertyOptional({ example: 38.5, description: 'Head circumference in cm (optional)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  headCircumferenceCm?: number;

  @ApiPropertyOptional({ example: 'Dr. Smith', description: 'Measured by' })
  @IsOptional()
  @IsString()
  measuredBy?: string;

  @ApiPropertyOptional({ example: 'City Hospital', description: 'Measurement location' })
  @IsOptional()
  @IsString()
  location?: string;
}
