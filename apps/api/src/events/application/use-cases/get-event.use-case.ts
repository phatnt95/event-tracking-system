import { Inject, Injectable } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventResponse } from '@baby-tracker/shared-types';
import { BabyNotFoundException, ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { EventNotFoundException } from '../../domain/errors/event.errors';
import { Event } from '../../domain/entities/event.entity';

@Injectable()
export class GetEventUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepo: IEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, eventId: string, ownerId: string): Promise<EventResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const event = await this.eventRepo.findById(eventId);
    if (!event || event.babyId !== babyId) {
      throw new EventNotFoundException(eventId);
    }

    return this.toResponse(event);
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
