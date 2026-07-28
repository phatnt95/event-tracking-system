import { Injectable, Inject } from '@nestjs/common';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { DiaperResponse } from '@baby-tracker/shared-types';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';

@Injectable()
export class GetDiaperUseCase {
  constructor(
    @Inject('IDiaperEventRepository')
    private readonly diaperEventRepository: IDiaperEventRepository,
  ) {}

  async execute(id: string, babyId: string): Promise<DiaperResponse> {
    const diaperEvent = await this.diaperEventRepository.findByEventId(id);

    if (!diaperEvent || !diaperEvent.event || diaperEvent.event.babyId !== babyId) {
      throw new DiaperNotFoundException();
    }

    const baseEvent = diaperEvent.event;

    return {
      id: baseEvent.id,
      eventId: baseEvent.id,
      babyId: baseEvent.babyId,
      type: baseEvent.type,
      occurredAt: baseEvent.occurredAt.toISOString(),
      note: baseEvent.note,
      createdBy: baseEvent.createdBy,
      createdAt: baseEvent.createdAt.toISOString(),
      updatedAt: baseEvent.updatedAt.toISOString(),
      status: diaperEvent.status,
      poopColor: diaperEvent.poopColor,
      poopConsistency: diaperEvent.poopConsistency,
      poopAmount: diaperEvent.poopAmount,
      hasBlood: diaperEvent.hasBlood,
      hasMucus: diaperEvent.hasMucus,
    };
  }
}
