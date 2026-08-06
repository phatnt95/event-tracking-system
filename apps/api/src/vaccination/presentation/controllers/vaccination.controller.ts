import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { GetBabyVaccinationsUseCase } from '../../application/use-cases/get-baby-vaccinations.use-case';
import { GetVaccinationDetailUseCase } from '../../application/use-cases/get-vaccination-detail.use-case';
import { CompleteVaccinationUseCase } from '../../application/use-cases/complete-vaccination.use-case';
import { UpdateVaccinationUseCase } from '../../application/use-cases/update-vaccination.use-case';
import { CompleteVaccinationDto } from '../../application/dtos/complete-vaccination.dto';
import { UpdateVaccinationDto } from '../../application/dtos/update-vaccination.dto';
import { BabyVaccinationsResponse, VaccinationRecordResponse } from '@baby-tracker/shared-types';

@ApiTags('Vaccinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class VaccinationController {
  constructor(
    private readonly getBabyVaccinationsUseCase: GetBabyVaccinationsUseCase,
    private readonly getVaccinationDetailUseCase: GetVaccinationDetailUseCase,
    private readonly completeVaccinationUseCase: CompleteVaccinationUseCase,
    private readonly updateVaccinationUseCase: UpdateVaccinationUseCase,
  ) {}

  @Get('babies/:babyId/vaccinations')
  @ApiOperation({ summary: 'Get vaccination schedule and records for a baby' })
  @ApiResponse({ status: 200, description: 'Vaccination schedule retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async getBabyVaccinations(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
  ): Promise<BabyVaccinationsResponse> {
    return this.getBabyVaccinationsUseCase.execute(babyId, ownerId);
  }

  @Get('vaccinations/:id')
  @ApiOperation({ summary: 'Get vaccination record details by ID' })
  @ApiResponse({ status: 200, description: 'Vaccination record details retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Vaccination record not found.' })
  async getDetail(
    @CurrentUser('userId') ownerId: string,
    @Param('id') id: string,
  ): Promise<VaccinationRecordResponse> {
    return this.getVaccinationDetailUseCase.execute(id, ownerId);
  }

  @Patch('vaccinations/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a vaccination record as completed' })
  @ApiResponse({ status: 200, description: 'Vaccination marked completed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid date or already completed.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Vaccination record not found.' })
  async complete(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CompleteVaccinationDto,
  ): Promise<VaccinationRecordResponse> {
    return this.completeVaccinationUseCase.execute(id, dto, userId);
  }

  @Patch('vaccinations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update details of a vaccination record' })
  @ApiResponse({ status: 200, description: 'Vaccination record updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid date or payload.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Vaccination record not found.' })
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
  ): Promise<VaccinationRecordResponse> {
    return this.updateVaccinationUseCase.execute(id, dto, userId);
  }
}
