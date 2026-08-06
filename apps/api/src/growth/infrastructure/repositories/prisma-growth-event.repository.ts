import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateGrowthParams,
  IGrowthEventRepository,
  UpdateGrowthParams,
} from '../../domain/repositories/growth-event.repository.interface';
import { GrowthEvent } from '../../domain/entities/growth-event.entity';
import { Event as EventEntity } from '../../../events/domain/entities/event.entity';
import { EventType } from '@baby-tracker/shared-types';

type DbGrowthWithEvent = Prisma.GrowthEventGetPayload<{ include: { event: true } }>;

@Injectable()
export class PrismaGrowthEventRepository implements IGrowthEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateGrowthParams): Promise<GrowthEvent> {
    const result = await this.prisma.growthEvent.create({
      data: {
        weightKg: params.weightKg,
        heightCm: params.heightCm,
        headCircumferenceCm: params.headCircumferenceCm,
        measuredBy: params.measuredBy,
        location: params.location,
        event: {
          create: {
            babyId: params.babyId,
            type: EventType.GROWTH,
            occurredAt: params.occurredAt,
            note: params.note || '',
            createdBy: params.createdBy,
          },
        },
      },
      include: { event: true },
    });

    return this.mapToEntity(result);
  }

  async update(eventId: string, params: UpdateGrowthParams): Promise<GrowthEvent> {
    const result = await this.prisma.growthEvent.update({
      where: { eventId },
      data: {
        ...(params.weightKg !== undefined && { weightKg: params.weightKg }),
        ...(params.heightCm !== undefined && { heightCm: params.heightCm }),
        ...(params.headCircumferenceCm !== undefined && {
          headCircumferenceCm: params.headCircumferenceCm,
        }),
        ...(params.measuredBy !== undefined && { measuredBy: params.measuredBy }),
        ...(params.location !== undefined && { location: params.location }),
        ...(params.occurredAt !== undefined || params.note !== undefined
          ? {
              event: {
                update: {
                  ...(params.occurredAt !== undefined && { occurredAt: params.occurredAt }),
                  ...(params.note !== undefined && { note: params.note }),
                },
              },
            }
          : {}),
      },
      include: { event: true },
    });

    return this.mapToEntity(result);
  }

  async delete(eventId: string): Promise<void> {
    await this.prisma.event.delete({ where: { id: eventId } });
  }

  async findByEventId(eventId: string): Promise<GrowthEvent | null> {
    const result = await this.prisma.growthEvent.findUnique({
      where: { eventId },
      include: { event: true },
    });
    if (!result) return null;
    return this.mapToEntity(result);
  }

  async findByBabyId(babyId: string): Promise<GrowthEvent[]> {
    const results = await this.prisma.growthEvent.findMany({
      where: {
        event: { babyId },
      },
      include: { event: true },
      orderBy: { event: { occurredAt: 'desc' } },
    });

    return results.map((item) => this.mapToEntity(item));
  }

  async findLatestByBabyId(babyId: string): Promise<GrowthEvent | null> {
    const result = await this.prisma.growthEvent.findFirst({
      where: {
        event: { babyId },
      },
      include: { event: true },
      orderBy: { event: { occurredAt: 'desc' } },
    });

    if (!result) return null;
    return this.mapToEntity(result);
  }

  private mapToEntity(result: DbGrowthWithEvent): GrowthEvent {
    return new GrowthEvent(
      result.id,
      result.eventId,
      result.weightKg,
      result.createdAt,
      result.updatedAt,
      result.heightCm,
      result.headCircumferenceCm,
      result.measuredBy,
      result.location,
      new EventEntity(
        result.event.id,
        result.event.babyId,
        result.event.type as EventType,
        result.event.occurredAt,
        result.event.note,
        result.event.createdBy,
        result.event.createdAt,
        result.event.updatedAt,
      ),
    );
  }
}
