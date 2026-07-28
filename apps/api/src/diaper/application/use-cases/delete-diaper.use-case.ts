import { Inject, Injectable } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';

@Injectable()
export class DeleteDiaperUseCase {
  constructor(
    @Inject(IDiaperEventRepository) private readonly diaperRepo: IDiaperEventRepository,
    @Inject(IBabyRepository) private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, eventId: string, ownerId: string): Promise<void> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) throw new BabyNotFoundException(babyId);
    if (baby.ownerId !== ownerId) throw new ForbiddenBabyAccessException();
    const diaper = await this.diaperRepo.findByEventId(eventId);
    if (!diaper || diaper.event?.babyId !== babyId) throw new DiaperNotFoundException(eventId);
    await this.diaperRepo.delete(eventId);
  }
}
