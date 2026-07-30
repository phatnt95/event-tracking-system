import { Injectable } from '@nestjs/common';
import { DiaperStatus, FeedType } from '@baby-tracker/shared-types';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  DashboardSummary,
  IDashboardRepository,
} from '../../domain/repositories/dashboard.repository.interface';

@Injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDailySummary(babyId: string, from: Date, to: Date): Promise<DashboardSummary> {
    const eventDateRange = {
      babyId,
      occurredAt: {
        gte: from,
        lt: to,
      },
    };

    const [feedCount, milkTotal, diaperCounts, lastFeeding, lastDiaper] = await Promise.all([
      this.prisma.feedEvent.aggregate({
        where: {
          event: eventDateRange,
        },
        _count: { _all: true },
      }),
      this.prisma.feedEvent.aggregate({
        where: {
          event: eventDateRange,
          feedType: {
            in: [FeedType.BREAST_MILK_BOTTLE, FeedType.FORMULA],
          },
        },
        _sum: {
          consumedVolume: true,
        },
      }),
      this.prisma.diaperEvent.groupBy({
        by: ['status'],
        where: {
          event: eventDateRange,
        },
        _count: { _all: true },
      }),
      this.prisma.feedEvent.findFirst({
        where: {
          event: eventDateRange,
        },
        select: {
          feedType: true,
          consumedVolume: true,
          event: {
            select: {
              occurredAt: true,
            },
          },
        },
        orderBy: {
          event: {
            occurredAt: 'desc',
          },
        },
      }),
      this.prisma.diaperEvent.findFirst({
        where: {
          event: eventDateRange,
        },
        select: {
          status: true,
          event: {
            select: {
              occurredAt: true,
            },
          },
        },
        orderBy: {
          event: {
            occurredAt: 'desc',
          },
        },
      }),
    ]);

    const countByStatus = new Map(diaperCounts.map((count) => [count.status, count._count._all]));

    return {
      feedCount: feedCount._count._all,
      milkIntakeMl: milkTotal._sum.consumedVolume ?? 0,
      peeCount:
        (countByStatus.get(DiaperStatus.PEE) ?? 0) + (countByStatus.get(DiaperStatus.BOTH) ?? 0),
      poopCount:
        (countByStatus.get(DiaperStatus.POOP) ?? 0) + (countByStatus.get(DiaperStatus.BOTH) ?? 0),
      lastFeeding: lastFeeding
        ? {
            occurredAt: lastFeeding.event.occurredAt.toISOString(),
            feedType: lastFeeding.feedType as FeedType,
            consumedVolume: lastFeeding.consumedVolume,
          }
        : null,
      lastDiaper: lastDiaper
        ? {
            occurredAt: lastDiaper.event.occurredAt.toISOString(),
            status: lastDiaper.status as DiaperStatus,
          }
        : null,
    };
  }
}
