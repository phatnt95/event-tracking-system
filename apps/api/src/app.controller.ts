import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { HealthResponseDto } from './common/dtos/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Database health status' })
  @ApiResponse({ status: 200, description: 'API health status', type: HealthResponseDto })
  async getHealth(): Promise<HealthResponseDto> {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'UP' : 'DOWN',
      services: {
        api: 'UP',
        database: dbStatus,
      },
    };
  }
}
