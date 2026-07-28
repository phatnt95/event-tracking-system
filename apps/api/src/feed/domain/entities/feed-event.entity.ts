import { Event } from '../../../events/domain/entities/event.entity';
import { FeedType } from '@baby-tracker/shared-types';

export class FeedEvent {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly baseEvent: Event,
    public readonly feedType: FeedType,
    public readonly leftDuration?: number | null,
    public readonly rightDuration?: number | null,
    public readonly preparedVolume?: number | null,
    public readonly consumedVolume?: number | null,
    public readonly brand?: string | null,
    public readonly stage?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
