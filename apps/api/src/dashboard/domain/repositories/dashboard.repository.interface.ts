import { DashboardLastDiaper, DashboardLastFeeding } from '@baby-tracker/shared-types';

export interface DashboardSummary {
  feedCount: number;
  milkIntakeMl: number;
  peeCount: number;
  poopCount: number;
  lastFeeding: DashboardLastFeeding | null;
  lastDiaper: DashboardLastDiaper | null;
}

export interface IDashboardRepository {
  getDailySummary(babyId: string, from: Date, to: Date): Promise<DashboardSummary>;
}

export const IDashboardRepository = Symbol('IDashboardRepository');
