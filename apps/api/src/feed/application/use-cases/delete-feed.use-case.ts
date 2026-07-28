import { Inject, Injectable } from '@nestjs/common';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { FeedNotFoundException } from '../../domain/errors/feed.errors';

@Injectable()
export class DeleteFeedUseCase {
  constructor(
    @Inject(IFeedEventRepository)
    private readonly feedRepo: IFeedEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    eventId: string,
    ownerId: string,
  ): Promise<void> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const feed = await this.feedRepo.findById(eventId);
    if (!feed || feed.baseEvent.babyId !== babyId) {
      throw new FeedNotFoundException(eventId);
    }

    await this.feedRepo.delete(eventId);
  }
}
