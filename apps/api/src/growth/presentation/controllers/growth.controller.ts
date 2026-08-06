import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CreateGrowthUseCase } from '../../application/use-cases/create-growth.use-case';
import { UpdateGrowthUseCase } from '../../application/use-cases/update-growth.use-case';
import { DeleteGrowthUseCase } from '../../application/use-cases/delete-growth.use-case';
import { GetLatestGrowthUseCase } from '../../application/use-cases/get-latest-growth.use-case';
import { ListGrowthUseCase } from '../../application/use-cases/list-growth.use-case';
import { CreateGrowthDto } from '../../application/dtos/create-growth.dto';
import { UpdateGrowthDto } from '../../application/dtos/update-growth.dto';
import {
  GrowthResponse,
  LatestGrowthResponse,
  GrowthRecordHistoryItem,
} from '@baby-tracker/shared-types';

@ApiTags('Growth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class GrowthController {
  constructor(
    private readonly createGrowthUseCase: CreateGrowthUseCase,
    private readonly updateGrowthUseCase: UpdateGrowthUseCase,
    private readonly deleteGrowthUseCase: DeleteGrowthUseCase,
    private readonly getLatestGrowthUseCase: GetLatestGrowthUseCase,
    private readonly listGrowthUseCase: ListGrowthUseCase,
  ) {}

  @Get('babies/:babyId/growth/latest')
  @ApiOperation({ summary: 'Get latest recorded weight and age in weeks for a baby' })
  @ApiResponse({ status: 200, description: 'Latest growth measurement retrieved.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async getLatest(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
  ): Promise<LatestGrowthResponse | null> {
    return this.getLatestGrowthUseCase.execute(babyId, ownerId);
  }

  @Get('babies/:babyId/growth')
  @ApiOperation({ summary: 'Get growth history for a baby, newest first' })
  @ApiResponse({ status: 200, description: 'List of growth measurements.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async list(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
  ): Promise<GrowthRecordHistoryItem[]> {
    return this.listGrowthUseCase.execute(babyId, ownerId);
  }

  @Post('babies/:babyId/growth')
  @ApiOperation({ summary: 'Create a new growth measurement for a baby' })
  @ApiResponse({ status: 201, description: 'Growth record created.' })
  @ApiResponse({ status: 400, description: 'Invalid weight or date.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async createForBaby(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Body() dto: CreateGrowthDto,
  ): Promise<GrowthResponse> {
    return this.createGrowthUseCase.execute(babyId, ownerId, dto);
  }

  @Patch('growth/:id')
  @ApiOperation({ summary: 'Update an existing growth measurement' })
  @ApiResponse({ status: 200, description: 'Growth record updated.' })
  @ApiResponse({ status: 400, description: 'Invalid weight or date.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Growth record not found.' })
  async update(
    @CurrentUser('userId') ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGrowthDto,
  ): Promise<GrowthResponse> {
    return this.updateGrowthUseCase.execute(id, ownerId, dto);
  }

  @Delete('growth/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a growth measurement' })
  @ApiResponse({ status: 204, description: 'Growth record deleted.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Growth record not found.' })
  async delete(@CurrentUser('userId') ownerId: string, @Param('id') id: string): Promise<void> {
    await this.deleteGrowthUseCase.execute(id, ownerId);
  }
}
