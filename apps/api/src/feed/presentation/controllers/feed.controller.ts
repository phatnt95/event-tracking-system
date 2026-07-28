import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CreateFeedDto } from '../../application/dtos/create-feed.dto';
import { UpdateFeedDto } from '../../application/dtos/update-feed.dto';
import { ListFeedsQueryDto } from '../../application/dtos/list-feeds-query.dto';
import { CreateFeedUseCase } from '../../application/use-cases/create-feed.use-case';
import { GetFeedUseCase } from '../../application/use-cases/get-feed.use-case';
import { ListFeedsUseCase } from '../../application/use-cases/list-feeds.use-case';
import { UpdateFeedUseCase } from '../../application/use-cases/update-feed.use-case';
import { DeleteFeedUseCase } from '../../application/use-cases/delete-feed.use-case';
import { FeedResponse } from '@baby-tracker/shared-types';

@ApiTags('Feeds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('babies/:babyId/feeds')
export class FeedController {
  constructor(
    private readonly createFeedUseCase: CreateFeedUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly listFeedsUseCase: ListFeedsUseCase,
    private readonly updateFeedUseCase: UpdateFeedUseCase,
    private readonly deleteFeedUseCase: DeleteFeedUseCase,
  ) {}

  @Post()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({ summary: 'Log a new feed event (breastfeeding, bottle, or formula)' })
  @ApiResponse({ status: 201, description: 'Feed event logged successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure (e.g. consumedVolume > preparedVolume).' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async create(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Body() dto: CreateFeedDto,
  ): Promise<FeedResponse> {
    return this.createFeedUseCase.execute(babyId, ownerId, dto);
  }

  @Get()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({ summary: 'List feed history for a baby' })
  @ApiResponse({ status: 200, description: 'List of feed events.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async list(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Query() query: ListFeedsQueryDto,
  ): Promise<FeedResponse[]> {
    return this.listFeedsUseCase.execute(babyId, ownerId, query);
  }

  @Get(':eventId')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Get details of a single feed event' })
  @ApiResponse({ status: 200, description: 'Feed event details retrieved.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Feed event or baby not found.' })
  async get(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
  ): Promise<FeedResponse> {
    return this.getFeedUseCase.execute(babyId, eventId, ownerId);
  }

  @Patch(':eventId')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Update an existing feed event' })
  @ApiResponse({ status: 200, description: 'Feed event updated successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Feed event or baby not found.' })
  async update(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateFeedDto,
  ): Promise<FeedResponse> {
    return this.updateFeedUseCase.execute(babyId, eventId, ownerId, dto);
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Delete a feed event' })
  @ApiResponse({ status: 204, description: 'Feed event deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Feed event or baby not found.' })
  async delete(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    await this.deleteFeedUseCase.execute(babyId, eventId, ownerId);
  }
}
