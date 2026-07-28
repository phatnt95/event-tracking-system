import { Inject, Injectable } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventResponse } from '@baby-tracker/shared-types';
import { BabyNotFoundException, ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { ListEventsQueryDto } from '../dtos/list-events-query.dto';
import { Event } from '../../domain/entities/event.entity';

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepo: IEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string, query: ListEventsQueryDto): Promise<EventResponse[]> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const events = await this.eventRepo.findByBaby(babyId, {
      type: query.type,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit: query.limit ?? 50,
    });

    return events.map((e) => this.toResponse(e));
  }

  private toResponse(event: Event): EventResponse {
    return {
      id: event.id,
      babyId: event.babyId,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      note: event.note,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}
