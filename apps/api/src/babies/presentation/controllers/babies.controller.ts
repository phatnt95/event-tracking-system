import {
  Controller,
  Get,
  Post,
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
import { CreateBabyDto } from '../../application/dtos/create-baby.dto';
import { UpdateBabyDto } from '../../application/dtos/update-baby.dto';
import { CreateBabyUseCase } from '../../application/use-cases/create-baby.use-case';
import { UpdateBabyUseCase } from '../../application/use-cases/update-baby.use-case';
import { GetBabyUseCase } from '../../application/use-cases/get-baby.use-case';
import { ListBabiesUseCase } from '../../application/use-cases/list-babies.use-case';
import { ArchiveBabyUseCase } from '../../application/use-cases/archive-baby.use-case';
import { BabyResponse } from '@baby-tracker/shared-types';

@ApiTags('Babies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('babies')
export class BabiesController {
  constructor(
    private readonly createBabyUseCase: CreateBabyUseCase,
    private readonly updateBabyUseCase: UpdateBabyUseCase,
    private readonly getBabyUseCase: GetBabyUseCase,
    private readonly listBabiesUseCase: ListBabiesUseCase,
    private readonly archiveBabyUseCase: ArchiveBabyUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new baby profile' })
  @ApiResponse({ status: 201, description: 'Baby successfully registered.' })
  async create(
    @CurrentUser('userId') ownerId: string,
    @Body() dto: CreateBabyDto,
  ): Promise<BabyResponse> {
    return this.createBabyUseCase.execute(ownerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all babies owned by the current user' })
  @ApiResponse({ status: 200, description: 'List of active baby profiles.' })
  async list(@CurrentUser('userId') ownerId: string): Promise<BabyResponse[]> {
    return this.listBabiesUseCase.execute(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve baby profile by ID' })
  @ApiResponse({ status: 200, description: 'Baby details retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby profile not found.' })
  async get(
    @CurrentUser('userId') ownerId: string,
    @Param('id') id: string,
  ): Promise<BabyResponse> {
    return this.getBabyUseCase.execute(id, ownerId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update details of an existing baby' })
  @ApiResponse({ status: 200, description: 'Baby details updated successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby profile not found.' })
  async update(
    @CurrentUser('userId') ownerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBabyDto,
  ): Promise<BabyResponse> {
    return this.updateBabyUseCase.execute(id, ownerId, dto);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a baby profile (soft delete)' })
  @ApiResponse({ status: 200, description: 'Baby profile successfully archived.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby profile not found.' })
  async archive(
    @CurrentUser('userId') ownerId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.archiveBabyUseCase.execute(id, ownerId);
    return { success: true };
  }
}
