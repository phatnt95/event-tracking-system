import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiProperty({
    example: '2026-07-27T09:00:00.000Z',
    description: 'Corrected timestamp of when the event occurred (ISO 8601)',
    required: false,
  })
  @IsDateString({}, { message: 'occurredAt must be a valid ISO date string' })
  @IsOptional()
  occurredAt?: string;

  @ApiProperty({
    example: 'Updated note.',
    description: 'Updated note about the event',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
