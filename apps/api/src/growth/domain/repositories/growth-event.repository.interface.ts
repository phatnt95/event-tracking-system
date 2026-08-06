import { GrowthEvent } from '../entities/growth-event.entity';

export interface CreateGrowthParams {
  babyId: string;
  weightKg: number;
  occurredAt: Date;
  createdBy: string;
  note?: string;
  heightCm?: number | null;
  headCircumferenceCm?: number | null;
  measuredBy?: string | null;
  location?: string | null;
}

export interface UpdateGrowthParams {
  weightKg?: number;
  occurredAt?: Date;
  note?: string;
  heightCm?: number | null;
  headCircumferenceCm?: number | null;
  measuredBy?: string | null;
  location?: string | null;
}

export interface IGrowthEventRepository {
  create(params: CreateGrowthParams): Promise<GrowthEvent>;
  update(eventId: string, params: UpdateGrowthParams): Promise<GrowthEvent>;
  delete(eventId: string): Promise<void>;
  findByEventId(eventId: string): Promise<GrowthEvent | null>;
  findByBabyId(babyId: string): Promise<GrowthEvent[]>;
  findLatestByBabyId(babyId: string): Promise<GrowthEvent | null>;
}

export const IGrowthEventRepository = Symbol('IGrowthEventRepository');
