import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CreateDiaperUseCase } from '../../application/use-cases/create-diaper.use-case';
import { GetDiaperUseCase } from '../../application/use-cases/get-diaper.use-case';
import { ListDiapersUseCase } from '../../application/use-cases/list-diapers.use-case';
import { UpdateDiaperUseCase } from '../../application/use-cases/update-diaper.use-case';
import { DeleteDiaperUseCase } from '../../application/use-cases/delete-diaper.use-case';
import { CreateDiaperDto } from '../../application/dtos/create-diaper.dto';
import { UpdateDiaperDto } from '../../application/dtos/update-diaper.dto';
import { ListDiapersQueryDto } from '../../application/dtos/list-diapers-query.dto';
import { DiaperResponse } from '@baby-tracker/shared-types';

@ApiTags('Diapers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('babies/:babyId/diapers')
export class DiaperController {
  constructor(
    private readonly createDiaperUseCase: CreateDiaperUseCase,
    private readonly getDiaperUseCase: GetDiaperUseCase,
    private readonly listDiapersUseCase: ListDiapersUseCase,
    private readonly updateDiaperUseCase: UpdateDiaperUseCase,
    private readonly deleteDiaperUseCase: DeleteDiaperUseCase,
  ) {}

  @Post()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({ summary: 'Create a diaper event for a baby' })
  @ApiResponse({ status: 201, description: 'Diaper event created successfully' })
  async create(
    @Param('babyId') babyId: string,
    @Body() dto: CreateDiaperDto,
    @CurrentUser('userId') ownerId: string,
  ): Promise<DiaperResponse> {
    return this.createDiaperUseCase.execute(babyId, ownerId, dto);
  }

  @Get()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({ summary: 'List diaper events for a baby' })
  @ApiResponse({ status: 200, description: 'List of diaper events' })
  async list(
    @Param('babyId') babyId: string,
    @CurrentUser('userId') ownerId: string,
    @Query() query: ListDiapersQueryDto,
  ): Promise<DiaperResponse[]> {
    return this.listDiapersUseCase.execute(babyId, ownerId, query);
  }

  @Get(':id')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'id', description: 'Base event ID' })
  @ApiOperation({ summary: 'Get a specific diaper event' })
  @ApiResponse({ status: 200, description: 'Diaper event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async get(
    @Param('babyId') babyId: string,
    @Param('id') id: string,
    @CurrentUser('userId') ownerId: string,
  ): Promise<DiaperResponse> {
    return this.getDiaperUseCase.execute(babyId, id, ownerId);
  }

  @Patch(':id')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'id', description: 'Base event ID' })
  @ApiOperation({ summary: 'Update a specific diaper event' })
  @ApiResponse({ status: 200, description: 'Diaper event updated' })
  async update(
    @Param('babyId') babyId: string,
    @Param('id') id: string,
    @CurrentUser('userId') ownerId: string,
    @Body() dto: UpdateDiaperDto,
  ): Promise<DiaperResponse> {
    return this.updateDiaperUseCase.execute(babyId, id, ownerId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific diaper event' })
  @ApiResponse({ status: 204, description: 'Diaper event deleted' })
  async delete(
    @Param('babyId') babyId: string,
    @Param('id') id: string,
    @CurrentUser('userId') ownerId: string,
  ): Promise<void> {
    await this.deleteDiaperUseCase.execute(babyId, id, ownerId);
  }
}
