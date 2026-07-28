import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';
import { FeedType } from '@baby-tracker/shared-types';
import { Type } from 'class-transformer';

export class ListFeedsQueryDto {
  @ApiPropertyOptional({ enum: FeedType, description: 'Filter by FeedType' })
  @IsOptional()
  @IsEnum(FeedType)
  feedType?: FeedType;

  @ApiPropertyOptional({
    description: 'Filter feeds occurred on or after this ISO timestamp',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter feeds occurred on or before this ISO timestamp',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ description: 'Max items to return (default 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
