import { ApiProperty } from '@nestjs/swagger';

export class HealthServicesDto {
  @ApiProperty({ example: 'UP' })
  api!: string;

  @ApiProperty({ example: 'UP' })
  database!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'UP' })
  status!: string;

  @ApiProperty({ type: HealthServicesDto })
  services!: HealthServicesDto;
}
