import { DashboardDiaperChangeStatus } from '@baby-tracker/shared-types';
import { getDiaperChangeStatus } from './dashboard.repository.interface';

describe('getDiaperChangeStatus', () => {
  it.each([
    [0, DashboardDiaperChangeStatus.WARNING],
    [5, DashboardDiaperChangeStatus.WARNING],
    [6, DashboardDiaperChangeStatus.NORMAL],
    [8, DashboardDiaperChangeStatus.NORMAL],
    [9, DashboardDiaperChangeStatus.WARNING],
    [10, DashboardDiaperChangeStatus.CRITICAL],
  ])('returns the correct status for %i diaper changes', (count, expectedStatus) => {
    expect(getDiaperChangeStatus(count)).toBe(expectedStatus);
  });
});
