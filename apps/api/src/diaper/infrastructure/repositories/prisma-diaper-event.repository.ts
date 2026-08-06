import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DiaperStatus,
  EventType,
  PoopAmount,
  PoopColor,
  PoopConsistency,
} from '@baby-tracker/shared-types';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateDiaperParams,
  IDiaperEventRepository,
  ListDiapersFilter,
  UpdateDiaperParams,
} from '../../domain/repositories/diaper-event.repository.interface';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';
import { Event as EventEntity } from '../../../events/domain/entities/event.entity';

type DbDiaperWithEvent = Prisma.DiaperEventGetPayload<{ include: { event: true } }>;

@Injectable()
export class PrismaDiaperEventRepository implements IDiaperEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateDiaperParams): Promise<DiaperEvent> {
    const result = await this.prisma.diaperEvent.create({
      data: {
        status: params.status,
        poopColor: params.poopColor,
        poopConsistency: params.poopConsistency,
        poopAmount: params.poopAmount,
        hasBlood: params.hasBlood ?? false,
        hasMucus: params.hasMucus ?? false,
        event: {
          create: {
            babyId: params.babyId,
            type: EventType.DIAPER,
            occurredAt: params.occurredAt,
            note: params.note ?? '',
            createdBy: params.createdBy,
          },
        },
      },
      include: { event: true },
    });

    return this.mapToEntity(result);
  }

  async findByEventId(eventId: string): Promise<DiaperEvent | null> {
    const result = await this.prisma.diaperEvent.findUnique({
      where: { eventId },
      include: { event: true },
    });

    return result ? this.mapToEntity(result) : null;
  }

  async findByBaby(babyId: string, filter?: ListDiapersFilter): Promise<DiaperEvent[]> {
    const results = await this.prisma.diaperEvent.findMany({
      where: {
        event: {
          babyId,
          type: EventType.DIAPER,
          ...(filter?.from || filter?.to
            ? {
                occurredAt: {
                  ...(filter.from ? { gte: filter.from } : {}),
                  ...(filter.to ? { lte: filter.to } : {}),
                },
              }
            : {}),
        },
        ...(filter?.status ? { status: filter.status } : {}),
      },
      include: { event: true },
      orderBy: { event: { occurredAt: 'desc' } },
      take: filter?.limit ?? 50,
    });

    return results.map((result) => this.mapToEntity(result));
  }

  async update(eventId: string, params: UpdateDiaperParams): Promise<DiaperEvent> {
    const result = await this.prisma.diaperEvent.update({
      where: { eventId },
      data: {
        status: params.status,
        poopColor: params.poopColor,
        poopConsistency: params.poopConsistency,
        poopAmount: params.poopAmount,
        hasBlood: params.hasBlood,
        hasMucus: params.hasMucus,
        event: {
          update: {
            occurredAt: params.occurredAt,
            note: params.note,
          },
        },
      },
      include: { event: true },
    });

    return this.mapToEntity(result);
  }

  async delete(eventId: string): Promise<void> {
    await this.prisma.event.delete({ where: { id: eventId } });
  }

  private mapToEntity(result: DbDiaperWithEvent): DiaperEvent {
    return new DiaperEvent(
      result.id,
      result.eventId,
      result.status as DiaperStatus,
      result.hasBlood,
      result.hasMucus,
      result.createdAt,
      result.updatedAt,
      result.poopColor as PoopColor | null,
      result.poopConsistency as PoopConsistency | null,
      result.poopAmount as PoopAmount | null,
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
