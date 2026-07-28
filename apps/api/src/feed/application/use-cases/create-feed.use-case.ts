import { Inject, Injectable } from '@nestjs/common';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { CreateFeedDto } from '../dtos/create-feed.dto';
import { FeedResponse, EventType } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { InvalidFeedVolumeException } from '../../domain/errors/feed.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';

@Injectable()
export class CreateFeedUseCase {
  constructor(
    @Inject(IFeedEventRepository)
    private readonly feedRepo: IFeedEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    ownerId: string,
    dto: CreateFeedDto,
  ): Promise<FeedResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    if (
      dto.preparedVolume !== undefined &&
      dto.consumedVolume !== undefined &&
      dto.consumedVolume > dto.preparedVolume
    ) {
      throw new InvalidFeedVolumeException();
    }

    const feed = await this.feedRepo.create({
      babyId,
      createdBy: ownerId,
      occurredAt: new Date(dto.occurredAt),
      note: dto.note ?? '',
      feedType: dto.feedType,
      leftDuration: dto.leftDuration,
      rightDuration: dto.rightDuration,
      preparedVolume: dto.preparedVolume,
      consumedVolume: dto.consumedVolume,
      brand: dto.brand,
      stage: dto.stage,
    });

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
