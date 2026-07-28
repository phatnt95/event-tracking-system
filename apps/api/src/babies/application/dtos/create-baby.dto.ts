import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@baby-tracker/shared-types';

export class CreateBabyDto {
  @ApiProperty({ example: 'Liam', description: 'Baby first name' })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name!: string;

  @ApiProperty({ example: 'Lily', description: 'Baby nickname (optional)', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Baby gender' })
  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  gender!: Gender;

  @ApiProperty({ example: '2026-04-15T08:30:00.000Z', description: 'Baby birthday timestamp' })
  @IsDateString({}, { message: 'Invalid ISO date string format' })
  birthday!: string;

  @ApiProperty({ example: 3.4, description: 'Baby birth weight (kg) (optional)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  birthWeight?: number;

  @ApiProperty({ example: 50.5, description: 'Baby birth height (cm) (optional)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  birthHeight?: number;

  @ApiProperty({
    example: 'Born healthy at general hospital.',
    description: 'Note / delivery details (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
