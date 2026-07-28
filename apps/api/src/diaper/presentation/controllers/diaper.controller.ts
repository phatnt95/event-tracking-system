import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateDiaperUseCase } from '../../application/use-cases/create-diaper.use-case';
import { GetDiaperUseCase } from '../../application/use-cases/get-diaper.use-case';
import { ListDiapersUseCase } from '../../application/use-cases/list-diapers.use-case';
import { UpdateDiaperUseCase } from '../../application/use-cases/update-diaper.use-case';
import { DeleteDiaperUseCase } from '../../application/use-cases/delete-diaper.use-case';
import { CreateDiaperDto } from '../../application/dtos/create-diaper.dto';
import { UpdateDiaperDto } from '../../application/dtos/update-diaper.dto';
import { ListDiapersQueryDto } from '../../application/dtos/list-diapers-query.dto';

@ApiTags('diapers')
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
  @ApiOperation({ summary: 'Create a diaper event for a baby' })
  @ApiResponse({ status: 201, description: 'Diaper event created successfully' })
  async create(
    @Param('babyId') babyId: string,
    @Body() dto: CreateDiaperDto,
    @Request() req: any,
  ) {
    return this.createDiaperUseCase.execute(babyId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List diaper events for a baby' })
  @ApiResponse({ status: 200, description: 'List of diaper events' })
  async list(
    @Param('babyId') babyId: string,
    @Query() query: ListDiapersQueryDto,
  ) {
    return this.listDiapersUseCase.execute(babyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific diaper event' })
  @ApiResponse({ status: 200, description: 'Diaper event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async get(@Param('babyId') babyId: string, @Param('id') id: string) {
    return this.getDiaperUseCase.execute(id, babyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific diaper event' })
  @ApiResponse({ status: 200, description: 'Diaper event updated' })
  async update(
    @Param('babyId') babyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDiaperDto,
  ) {
    return this.updateDiaperUseCase.execute(id, babyId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific diaper event' })
  @ApiResponse({ status: 204, description: 'Diaper event deleted' })
  async delete(@Param('babyId') babyId: string, @Param('id') id: string) {
    await this.deleteDiaperUseCase.execute(id, babyId);
  }
}
