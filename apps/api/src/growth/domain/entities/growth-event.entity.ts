import { Event as EventEntity } from '../../../events/domain/entities/event.entity';

export class GrowthEvent {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly weightKg: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly heightCm?: number | null,
    public readonly headCircumferenceCm?: number | null,
    public readonly measuredBy?: string | null,
    public readonly location?: string | null,
    public readonly event?: EventEntity,
  ) {}
}
