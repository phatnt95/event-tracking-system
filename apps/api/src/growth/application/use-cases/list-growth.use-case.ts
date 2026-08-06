import { Injectable, Inject } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';
import { GrowthRecordHistoryItem } from '@baby-tracker/shared-types';

@Injectable()
export class ListGrowthUseCase {
  constructor(
    @Inject(IGrowthEventRepository)
    private readonly growthRepo: IGrowthEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string): Promise<GrowthRecordHistoryItem[]> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const records = await this.growthRepo.findByBabyId(babyId);
    const birthDate = new Date(baby.birthday);

    return records.map((record) => {
      const event = record.event!;
      const measuredDate = new Date(event.occurredAt);
      const ageWeeks = Math.max(
        0,
        Math.floor((measuredDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)),
      );

      return {
        id: record.id,
        eventId: record.eventId,
        weightKg: record.weightKg,
        measuredAt: event.occurredAt.toISOString(),
        ageWeeks,
        heightCm: record.heightCm,
        headCircumferenceCm: record.headCircumferenceCm,
        notes: event.note,
      };
    });
  }
}
