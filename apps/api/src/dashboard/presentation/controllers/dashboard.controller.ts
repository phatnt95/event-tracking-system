import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardResponse } from '@baby-tracker/shared-types';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { GetDashboardQueryDto } from '../../application/dtos/get-dashboard-query.dto';
import { GetDashboardUseCase } from '../../application/use-cases/get-dashboard.use-case';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  @ApiOperation({ summary: 'Get a baby activity summary for a local calendar date' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved.' })
  @ApiResponse({ status: 400, description: 'Invalid date or time zone.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async getDashboard(
    @CurrentUser('userId') ownerId: string,
    @Query() query: GetDashboardQueryDto,
  ): Promise<DashboardResponse> {
    const timeZone = query.timeZone ?? 'UTC';
    const date = query.date ?? this.getDashboardUseCase.getCurrentDate(timeZone);
    return this.getDashboardUseCase.execute(query.babyId, ownerId, date, timeZone);
  }
}
