import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({ example: true, description: 'Operation success status' })
  success!: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    required: false,
    description: 'Message details',
  })
  message?: string;
}
