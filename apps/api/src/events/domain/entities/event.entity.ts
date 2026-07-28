import { EventType } from '@baby-tracker/shared-types';

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
  ) {}
}
