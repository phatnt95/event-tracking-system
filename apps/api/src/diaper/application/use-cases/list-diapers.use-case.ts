import { Inject, Injectable } from '@nestjs/common';
import { DiaperResponse } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { ListDiapersQueryDto } from '../dtos/list-diapers-query.dto';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';

@Injectable()
export class ListDiapersUseCase {
  constructor(
    @Inject(IDiaperEventRepository) private readonly diaperRepo: IDiaperEventRepository,
    @Inject(IBabyRepository) private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    ownerId: string,
    query: ListDiapersQueryDto,
  ): Promise<DiaperResponse[]> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) throw new BabyNotFoundException(babyId);
    if (baby.ownerId !== ownerId) throw new ForbiddenBabyAccessException();
    const diapers = await this.diaperRepo.findByBaby(babyId, {
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit: query.limit ?? 50,
    });
    return diapers.map((diaper) => this.toResponse(diaper));
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
