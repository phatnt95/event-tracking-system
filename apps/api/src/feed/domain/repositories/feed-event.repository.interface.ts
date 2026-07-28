import { FeedEvent } from '../entities/feed-event.entity';
import { FeedType } from '@baby-tracker/shared-types';

export interface CreateFeedParams {
  babyId: string;
  createdBy: string;
  occurredAt: Date;
  note?: string;
  feedType: FeedType;
  leftDuration?: number;
  rightDuration?: number;
  preparedVolume?: number;
  consumedVolume?: number;
  brand?: string;
  stage?: string;
}

export interface UpdateFeedParams {
  occurredAt?: Date;
  note?: string;
  feedType?: FeedType;
  leftDuration?: number;
  rightDuration?: number;
  preparedVolume?: number;
  consumedVolume?: number;
  brand?: string;
  stage?: string;
}

export interface ListFeedsFilter {
  feedType?: FeedType;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface IFeedEventRepository {
  create(params: CreateFeedParams): Promise<FeedEvent>;
  update(eventId: string, params: UpdateFeedParams): Promise<FeedEvent>;
  findById(eventId: string): Promise<FeedEvent | null>;
  findByBaby(babyId: string, filter?: ListFeedsFilter): Promise<FeedEvent[]>;
  delete(eventId: string): Promise<void>;
}

export const IFeedEventRepository = Symbol('IFeedEventRepository');
