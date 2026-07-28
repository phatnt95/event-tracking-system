import { Event } from '../entities/event.entity';
import { EventType } from '@baby-tracker/shared-types';

export interface ListEventsFilter {
  type?: EventType;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface IEventRepository {
  create(event: {
    babyId: string;
    type: EventType;
    occurredAt: Date;
    note: string;
    createdBy: string;
  }): Promise<Event>;

  update(
    id: string,
    event: {
      occurredAt?: Date;
      note?: string;
    },
  ): Promise<Event>;

  findById(id: string): Promise<Event | null>;

  findByBaby(babyId: string, filter: ListEventsFilter): Promise<Event[]>;

  delete(id: string): Promise<void>;
}

export const IEventRepository = Symbol('IEventRepository');
