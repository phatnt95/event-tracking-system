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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/presentation/decorators/current-user.decorator';
import { CreateEventDto } from '../../application/dtos/create-event.dto';
import { UpdateEventDto } from '../../application/dtos/update-event.dto';
import { ListEventsQueryDto } from '../../application/dtos/list-events-query.dto';
import { CreateEventUseCase } from '../../application/use-cases/create-event.use-case';
import { GetEventUseCase } from '../../application/use-cases/get-event.use-case';
import { ListEventsUseCase } from '../../application/use-cases/list-events.use-case';
import { UpdateEventUseCase } from '../../application/use-cases/update-event.use-case';
import { DeleteEventUseCase } from '../../application/use-cases/delete-event.use-case';
import { EventResponse, EventTimelineResponse } from '@baby-tracker/shared-types';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('babies/:babyId/events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  @Post()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({ summary: 'Log a new event for a baby' })
  @ApiResponse({ status: 201, description: 'Event logged successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async create(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponse> {
    return this.createEventUseCase.execute(babyId, ownerId, dto);
  }

  @Get()
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiOperation({
    summary: 'List a baby timeline with cursor pagination, filters, and note search',
  })
  @ApiResponse({ status: 200, description: 'A cursor-paginated timeline page.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Baby not found.' })
  async list(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Query() query: ListEventsQueryDto,
  ): Promise<EventTimelineResponse> {
    return this.listEventsUseCase.execute(babyId, ownerId, query);
  }

  @Get(':eventId')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Event or baby not found.' })
  async get(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
  ): Promise<EventResponse> {
    return this.getEventUseCase.execute(babyId, eventId, ownerId);
  }

  @Patch(':eventId')
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Update an existing event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Event or baby not found.' })
  async update(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ): Promise<EventResponse> {
    return this.updateEventUseCase.execute(babyId, eventId, ownerId, dto);
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'babyId', description: 'Baby profile ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiOperation({ summary: 'Delete an event (hard delete)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Event or baby not found.' })
  async delete(
    @CurrentUser('userId') ownerId: string,
    @Param('babyId') babyId: string,
    @Param('eventId') eventId: string,
  ): Promise<void> {
    await this.deleteEventUseCase.execute(babyId, eventId, ownerId);
  }
}
