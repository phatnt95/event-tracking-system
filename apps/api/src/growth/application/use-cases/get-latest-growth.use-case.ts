import { Injectable, Inject } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';
import { LatestGrowthResponse } from '@baby-tracker/shared-types';

@Injectable()
export class GetLatestGrowthUseCase {
  constructor(
    @Inject(IGrowthEventRepository)
    private readonly growthRepo: IGrowthEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string): Promise<LatestGrowthResponse | null> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const latest = await this.growthRepo.findLatestByBabyId(babyId);
    if (!latest || !latest.event) {
      return null;
    }

    const birthDate = new Date(baby.birthday);
    const measuredDate = new Date(latest.event.occurredAt);
    const ageWeeks = Math.max(
      0,
      Math.floor((measuredDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)),
    );

    return {
      id: latest.id,
      weightKg: latest.weightKg,
      measuredAt: latest.event.occurredAt.toISOString(),
      ageWeeks,
    };
  }
}
