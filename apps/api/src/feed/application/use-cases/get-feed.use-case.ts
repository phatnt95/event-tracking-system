import { Inject, Injectable } from '@nestjs/common';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { FeedResponse, EventType } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { FeedNotFoundException } from '../../domain/errors/feed.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';

@Injectable()
export class GetFeedUseCase {
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
  ): Promise<FeedResponse> {
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

    return this.toResponse(feed);
  }

  private toResponse(feed: FeedEvent): FeedResponse {
    return {
      id: feed.baseEvent.id,
      eventId: feed.eventId,
      babyId: feed.baseEvent.babyId,
      type: EventType.FEED,
      feedType: feed.feedType,
      occurredAt: feed.baseEvent.occurredAt.toISOString(),
      note: feed.baseEvent.note,
      createdBy: feed.baseEvent.createdBy,
      leftDuration: feed.leftDuration,
      rightDuration: feed.rightDuration,
      preparedVolume: feed.preparedVolume,
      consumedVolume: feed.consumedVolume,
      brand: feed.brand,
      stage: feed.stage,
      createdAt: feed.baseEvent.createdAt.toISOString(),
      updatedAt: feed.baseEvent.updatedAt.toISOString(),
    };
  }
}
