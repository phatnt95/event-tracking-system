import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  DiaperStatus,
  PoopColor,
  PoopConsistency,
  PoopAmount,
} from '@baby-tracker/shared-types';

export class CreateDiaperDto {
  @ApiProperty({
    enum: DiaperStatus,
    example: DiaperStatus.POOP,
    description: 'Diaper status',
  })
  @IsEnum(DiaperStatus)
  status!: DiaperStatus;

  @ApiProperty({
    example: '2026-07-27T10:00:00.000Z',
    description: 'ISO timestamp when diaper change occurred',
  })
  @IsISO8601()
  occurredAt!: string;

  @ApiPropertyOptional({
    example: 'Baby seemed fuzzy.',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    enum: PoopColor,
    example: PoopColor.YELLOW,
    description: 'Color of the poop',
  })
  @IsOptional()
  @IsEnum(PoopColor)
  poopColor?: PoopColor;

  @ApiPropertyOptional({
    enum: PoopConsistency,
    example: PoopConsistency.SOFT,
    description: 'Consistency of the poop',
  })
  @IsOptional()
  @IsEnum(PoopConsistency)
  poopConsistency?: PoopConsistency;

  @ApiPropertyOptional({
    enum: PoopAmount,
    example: PoopAmount.MEDIUM,
    description: 'Amount of poop',
  })
  @IsOptional()
  @IsEnum(PoopAmount)
  poopAmount?: PoopAmount;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether blood was found',
  })
  @IsOptional()
  @IsBoolean()
  hasBlood?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether mucus was found',
  })
  @IsOptional()
  @IsBoolean()
  hasMucus?: boolean;
}
