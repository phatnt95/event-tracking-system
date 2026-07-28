import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The active refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token must not be empty' })
  refreshToken!: string;
}
