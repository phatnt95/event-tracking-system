import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompleteVaccinationDto as ICompleteVaccinationDto } from '@baby-tracker/shared-types';

export class CompleteVaccinationDto implements ICompleteVaccinationDto {
  @ApiProperty({ example: '2026-08-04T09:00:00.000Z', description: 'Actual vaccination timestamp' })
  @IsDateString({}, { message: 'Invalid ISO date string format' })
  @IsNotEmpty({ message: 'Actual vaccination date must not be empty' })
  actualVaccinationDate!: string;

  @ApiProperty({
    example: 'City Children Hospital',
    description: 'Hospital or clinic name',
    required: false,
  })
  @IsString()
  @IsOptional()
  hospitalClinic?: string;

  @ApiProperty({ example: 'Dr. John Doe', description: 'Attending doctor name', required: false })
  @IsString()
  @IsOptional()
  doctor?: string;

  @ApiProperty({ example: 'Sanofi Pasteur', description: 'Vaccine manufacturer', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 'BATCH-2026-X9', description: 'Vaccine batch number', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({
    example: 'Baby had slight fever afterwards.',
    description: 'Notes or reactions',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
