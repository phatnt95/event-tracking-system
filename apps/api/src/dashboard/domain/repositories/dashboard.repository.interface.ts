import {
  DashboardDiaperChangeStatus,
  DashboardLastDiaper,
  DashboardLastFeeding,
} from '@baby-tracker/shared-types';

export function getDiaperChangeStatus(count: number): DashboardDiaperChangeStatus {
  if (count >= 10) return DashboardDiaperChangeStatus.CRITICAL;
  if (count >= 6 && count <= 8) return DashboardDiaperChangeStatus.NORMAL;
  return DashboardDiaperChangeStatus.WARNING;
}

export interface DashboardSummary {
  feedCount: number;
  milkIntakeMl: number;
  breastfeedingLeftDurationMinutes: number;
  breastfeedingRightDurationMinutes: number;
  breastfeedingTotalDurationMinutes: number;
  diaperChangeCount: number;
  diaperChangeStatus: DashboardDiaperChangeStatus;
  peeCount: number;
  poopCount: number;
  lastFeeding: DashboardLastFeeding | null;
  lastDiaper: DashboardLastDiaper | null;
}

export interface IDashboardRepository {
  getDailySummary(babyId: string, from: Date, to: Date): Promise<DashboardSummary>;
}

export const IDashboardRepository = Symbol('IDashboardRepository');
