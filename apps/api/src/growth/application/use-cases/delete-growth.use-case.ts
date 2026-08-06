import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';

@Injectable()
export class DeleteGrowthUseCase {
  constructor(
    @Inject(IGrowthEventRepository)
    private readonly growthRepo: IGrowthEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(id: string, ownerId: string): Promise<void> {
    const existing = await this.growthRepo.findByEventId(id);
    if (!existing) {
      throw new NotFoundException('Growth record not found');
    }

    const baby = await this.babyRepo.findById(existing.event!.babyId);
    if (!baby || baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    await this.growthRepo.delete(existing.eventId);
  }
}
