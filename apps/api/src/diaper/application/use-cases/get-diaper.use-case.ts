import { Inject, Injectable } from '@nestjs/common';
import { DiaperResponse } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';

@Injectable()
export class GetDiaperUseCase {
  constructor(
    @Inject(IDiaperEventRepository) private readonly diaperRepo: IDiaperEventRepository,
    @Inject(IBabyRepository) private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, eventId: string, ownerId: string): Promise<DiaperResponse> {
    await this.assertBabyAccess(babyId, ownerId);
    const diaper = await this.diaperRepo.findByEventId(eventId);
    if (!diaper || diaper.event?.babyId !== babyId) throw new DiaperNotFoundException(eventId);
    return this.toResponse(diaper);
  }

  private async assertBabyAccess(babyId: string, ownerId: string): Promise<void> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) throw new BabyNotFoundException(babyId);
    if (baby.ownerId !== ownerId) throw new ForbiddenBabyAccessException();
  }

  private toResponse(diaper: DiaperEvent): DiaperResponse {
    const event = diaper.event!;
    return {
      id: event.id,
      eventId: diaper.eventId,
      babyId: event.babyId,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      note: event.note,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      status: diaper.status,
      poopColor: diaper.poopColor,
      poopConsistency: diaper.poopConsistency,
      poopAmount: diaper.poopAmount,
      hasBlood: diaper.hasBlood,
      hasMucus: diaper.hasMucus,
    };
  }
}
