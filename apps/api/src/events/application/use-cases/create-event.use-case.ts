import { Inject, Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dtos/create-event.dto';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventResponse } from '@baby-tracker/shared-types';
import { BabyNotFoundException, ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { Event } from '../../domain/entities/event.entity';

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepo: IEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string, dto: CreateEventDto): Promise<EventResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const event = await this.eventRepo.create({
      babyId,
      type: dto.type,
      occurredAt: new Date(dto.occurredAt),
      note: dto.note ?? '',
      createdBy: ownerId,
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
