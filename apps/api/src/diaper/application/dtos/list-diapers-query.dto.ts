import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsISO8601, IsInt, IsOptional, Max, Min } from 'class-validator';
import { DiaperStatus } from '@baby-tracker/shared-types';

export class ListDiapersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by diaper status',
    example: 'POOP',
  })
  @IsOptional()
  @IsEnum(DiaperStatus)
  status?: DiaperStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2026-07-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2026-07-27T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ description: 'Maximum records to return', default: 50, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
