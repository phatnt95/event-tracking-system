import { Inject, Injectable } from '@nestjs/common';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { ListFeedsQueryDto } from '../dtos/list-feeds-query.dto';
import { FeedResponse, EventType } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';

@Injectable()
export class ListFeedsUseCase {
  constructor(
    @Inject(IFeedEventRepository)
    private readonly feedRepo: IFeedEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    ownerId: string,
    query: ListFeedsQueryDto,
  ): Promise<FeedResponse[]> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const feeds = await this.feedRepo.findByBaby(babyId, {
      feedType: query.feedType,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      limit: query.limit ?? 50,
    });

    return feeds.map((f) => this.toResponse(f));
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
