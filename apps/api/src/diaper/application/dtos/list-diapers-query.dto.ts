import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListDiapersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by diaper status',
    example: 'POOP',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2026-07-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2026-07-27T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
