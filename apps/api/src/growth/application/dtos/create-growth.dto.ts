import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateGrowthDto {
  @ApiProperty({ example: 5.2, description: 'Weight in kg (must be > 0)' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  weightKg!: number;

  @ApiProperty({ example: '2026-08-01T08:00:00.000Z', description: 'Measurement date/time' })
  @IsISO8601()
  @IsNotEmpty()
  occurredAt!: string;

  @ApiPropertyOptional({ example: 'Routine checkup weight', description: 'Notes' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 58.5, description: 'Height in cm (optional)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  heightCm?: number;

  @ApiPropertyOptional({ example: 38.0, description: 'Head circumference in cm (optional)' })
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
