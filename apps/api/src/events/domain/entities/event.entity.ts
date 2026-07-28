import {
  DiaperStatus,
  EventType,
  FeedType,
  PoopAmount,
  PoopColor,
  PoopConsistency,
} from '@baby-tracker/shared-types';

export interface EventFeedDetails {
  feedType: FeedType;
  leftDuration: number | null;
  rightDuration: number | null;
  preparedVolume: number | null;
  consumedVolume: number | null;
  brand: string | null;
  stage: string | null;
}

export interface EventDiaperDetails {
  status: DiaperStatus;
  poopColor: PoopColor | null;
  poopConsistency: PoopConsistency | null;
  poopAmount: PoopAmount | null;
  hasBlood: boolean;
  hasMucus: boolean;
}

export class Event {
  constructor(
    public readonly id: string,
    public readonly babyId: string,
    public readonly type: EventType,
    public readonly occurredAt: Date,
    public readonly note: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly feed?: EventFeedDetails,
    public readonly diaper?: EventDiaperDetails,
  ) {}
}
