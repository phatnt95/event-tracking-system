import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class GetDashboardQueryDto {
  @IsUUID()
  babyId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must use the YYYY-MM-DD format',
  })
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timeZone?: string;
}
