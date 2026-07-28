import { Event } from '../../../events/domain/entities/event.entity';
import {
  DiaperStatus,
  PoopColor,
  PoopConsistency,
  PoopAmount,
} from '@baby-tracker/shared-types';

export class DiaperEvent {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly status: DiaperStatus,
    public readonly hasBlood: boolean,
    public readonly hasMucus: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly poopColor?: PoopColor | null,
    public readonly poopConsistency?: PoopConsistency | null,
    public readonly poopAmount?: PoopAmount | null,
    public readonly event?: Event,
  ) {}
}
