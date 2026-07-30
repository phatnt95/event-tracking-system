import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DashboardResponse } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import {
  DashboardSummary,
  IDashboardRepository,
} from '../../domain/repositories/dashboard.repository.interface';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject(IDashboardRepository)
    private readonly dashboardRepository: IDashboardRepository,
    @Inject(IBabyRepository)
    private readonly babyRepository: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    ownerId: string,
    date: string,
    timeZone?: string,
  ): Promise<DashboardResponse> {
    const baby = await this.babyRepository.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const [from, to] = this.getDayRange(date, timeZone ?? 'UTC');
    const summary = await this.dashboardRepository.getDailySummary(babyId, from, to);

    return this.toResponse(date, summary);
  }

  getCurrentDate(timeZone = 'UTC'): string {
    try {
      const values = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
          .formatToParts(new Date())
          .filter((part) => part.type !== 'literal')
          .map((part) => [part.type, part.value]),
      );
      return `${values.year}-${values.month}-${values.day}`;
    } catch {
      throw new BadRequestException('timeZone must be a valid IANA time zone');
    }
  }

  private getDayRange(date: string, timeZone: string): [Date, Date] {
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      throw new BadRequestException('date must be a valid calendar date');
    }

    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format();
    } catch {
      throw new BadRequestException('timeZone must be a valid IANA time zone');
    }

    const start = this.localDateTimeToUtc(year, month, day, timeZone);
    const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
    const end = this.localDateTimeToUtc(
      nextDate.getUTCFullYear(),
      nextDate.getUTCMonth() + 1,
      nextDate.getUTCDate(),
      timeZone,
    );
    return [start, end];
  }

  private localDateTimeToUtc(year: number, month: number, day: number, timeZone: string): Date {
    const target = Date.UTC(year, month - 1, day);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    let timestamp = target;

    for (let index = 0; index < 2; index += 1) {
      const values = Object.fromEntries(
        formatter
          .formatToParts(new Date(timestamp))
          .filter((part) => part.type !== 'literal')
          .map((part) => [part.type, Number(part.value)]),
      );
      const displayed = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second,
      );
      timestamp += target - displayed;
    }

    return new Date(timestamp);
  }

  private toResponse(date: string, summary: DashboardSummary): DashboardResponse {
    return {
      date,
      ...summary,
    };
  }
}
