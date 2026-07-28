import { Inject, Injectable } from '@nestjs/common';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { BabyNotFoundException, ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { EventNotFoundException } from '../../domain/errors/event.errors';

@Injectable()
export class DeleteEventUseCase {
  constructor(
    @Inject(IEventRepository)
    private readonly eventRepo: IEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, eventId: string, ownerId: string): Promise<void> {
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

    await this.eventRepo.delete(eventId);
  }
}
