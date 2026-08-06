import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  VaccinationStatus,
  UpdateVaccinationDto as IUpdateVaccinationDto,
} from '@baby-tracker/shared-types';

export class UpdateVaccinationDto implements IUpdateVaccinationDto {
  @ApiProperty({
    example: '2026-08-04T09:00:00.000Z',
    description: 'Actual vaccination timestamp',
    required: false,
  })
  @IsDateString({}, { message: 'Invalid ISO date string format' })
  @IsOptional()
  actualVaccinationDate?: string;

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

  @ApiProperty({ example: 'Updated notes.', description: 'Notes or reactions', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    enum: VaccinationStatus,
    example: VaccinationStatus.COMPLETED,
    description: 'Vaccination status',
    required: false,
  })
  @IsEnum(VaccinationStatus, { message: 'Invalid vaccination status' })
  @IsOptional()
  status?: VaccinationStatus;

  @ApiProperty({ example: false, description: 'Whether this vaccine is optional', required: false })
  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;
}
