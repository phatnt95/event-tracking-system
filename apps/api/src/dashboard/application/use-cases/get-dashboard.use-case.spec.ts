import { GetDashboardUseCase } from './get-dashboard.use-case';
import { DashboardDiaperChangeStatus, DiaperStatus, FeedType } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { IGrowthEventRepository } from '../../../growth/domain/repositories/growth-event.repository.interface';

describe('GetDashboardUseCase', () => {
  const dashboardRepository = {
    getDailySummary: jest.fn(),
  };
  const babyRepository = {
    findById: jest.fn(),
  };
  const growthRepository = {
    findLatestByBabyId: jest.fn().mockResolvedValue(null),
  };
  const useCase = new GetDashboardUseCase(
    dashboardRepository,
    babyRepository as unknown as IBabyRepository,
    growthRepository as unknown as IGrowthEventRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    babyRepository.findById.mockResolvedValue({ ownerId: 'user-1' });
    dashboardRepository.getDailySummary.mockResolvedValue({
      feedCount: 3,
      milkIntakeMl: 620,
      breastfeedingLeftDurationMinutes: 58,
      breastfeedingRightDurationMinutes: 62,
      breastfeedingTotalDurationMinutes: 120,
      diaperChangeCount: 7,
      diaperChangeStatus: DashboardDiaperChangeStatus.NORMAL,
      peeCount: 6,
      poopCount: 3,
      lastFeeding: {
        occurredAt: '2026-07-30T11:00:00.000Z',
        feedType: FeedType.FORMULA,
        consumedVolume: 120,
      },
      lastDiaper: {
        occurredAt: '2026-07-30T10:30:00.000Z',
        status: DiaperStatus.BOTH,
      },
    });
  });

  it('returns the summary for an owned baby using the requested local day', async () => {
    await expect(
      useCase.execute('baby-1', 'user-1', '2026-07-30', 'Asia/Ho_Chi_Minh'),
    ).resolves.toMatchObject({
      date: '2026-07-30',
      milkIntakeMl: 620,
      breastfeedingTotalDurationMinutes: 120,
      diaperChangeCount: 7,
      diaperChangeStatus: DashboardDiaperChangeStatus.NORMAL,
      peeCount: 6,
      poopCount: 3,
    });

    expect(dashboardRepository.getDailySummary).toHaveBeenCalledWith(
      'baby-1',
      new Date('2026-07-29T17:00:00.000Z'),
      new Date('2026-07-30T17:00:00.000Z'),
    );
  });

  it('rejects a dashboard request for a baby owned by someone else', async () => {
    babyRepository.findById.mockResolvedValue({ ownerId: 'another-user' });

    await expect(useCase.execute('baby-1', 'user-1', '2026-07-30', 'UTC')).rejects.toThrow(
      'You do not have access permissions',
    );
    expect(dashboardRepository.getDailySummary).not.toHaveBeenCalled();
  });

  it('rejects invalid calendar dates before querying the repository', async () => {
    await expect(useCase.execute('baby-1', 'user-1', '2026-02-30', 'UTC')).rejects.toThrow(
      'date must be a valid calendar date',
    );
    expect(dashboardRepository.getDailySummary).not.toHaveBeenCalled();
  });

  it('derives today using the requested time zone when no date is provided', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T01:00:00.000Z'));

    expect(useCase.getCurrentDate('America/Los_Angeles')).toBe('2026-07-29');

    jest.useRealTimers();
  });
});
