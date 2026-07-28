import { Inject, Injectable } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventResponse } from '@baby-tracker/shared-types';
import { BabyNotFoundException, ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { EventNotFoundException } from '../../domain/errors/event.errors';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { Event } from '../../domain/entities/event.entity';

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepo: IEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, eventId: string, ownerId: string, dto: UpdateEventDto): Promise<EventResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const existing = await this.eventRepo.findById(eventId);
    if (!existing || existing.babyId !== babyId) {
      throw new EventNotFoundException(eventId);
    }

    const event = await this.eventRepo.update(eventId, {
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      note: dto.note,
    });

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
