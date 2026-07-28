import { DiaperEvent } from '../entities/diaper-event.entity';
import { DiaperStatus, PoopAmount, PoopColor, PoopConsistency } from '@baby-tracker/shared-types';

export interface CreateDiaperParams {
  babyId: string;
  createdBy: string;
  occurredAt: Date;
  note?: string;
  status: DiaperStatus;
  poopColor?: PoopColor;
  poopConsistency?: PoopConsistency;
  poopAmount?: PoopAmount;
  hasBlood?: boolean;
  hasMucus?: boolean;
}

export interface UpdateDiaperParams {
  occurredAt?: Date;
  note?: string;
  status?: DiaperStatus;
  poopColor?: PoopColor | null;
  poopConsistency?: PoopConsistency | null;
  poopAmount?: PoopAmount | null;
  hasBlood?: boolean;
  hasMucus?: boolean;
}

export interface ListDiapersFilter {
  status?: DiaperStatus;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface IDiaperEventRepository {
  create(params: CreateDiaperParams): Promise<DiaperEvent>;
  findByEventId(eventId: string): Promise<DiaperEvent | null>;
  findByBaby(babyId: string, filter?: ListDiapersFilter): Promise<DiaperEvent[]>;
  update(eventId: string, params: UpdateDiaperParams): Promise<DiaperEvent>;
  delete(eventId: string): Promise<void>;
}

export const IDiaperEventRepository = Symbol('IDiaperEventRepository');
