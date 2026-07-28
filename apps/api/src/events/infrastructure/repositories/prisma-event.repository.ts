import { Injectable } from '@nestjs/common';
import {
  EventTimelinePage,
  IEventRepository,
  ListEventsFilter,
} from '../../domain/repositories/event.repository.interface';
import { Event as EventEntity } from '../../domain/entities/event.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventType } from '@baby-tracker/shared-types';

@Injectable()
export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(db: {
    id: string;
    babyId: string;
    type: string;
    occurredAt: Date;
    note: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): EventEntity {
    return new EventEntity(
      db.id,
      db.babyId,
      db.type as EventType,
      db.occurredAt,
      db.note,
      db.createdBy,
      db.createdAt,
      db.updatedAt,
    );
  }

  async create(event: {
    babyId: string;
    type: EventType;
    occurredAt: Date;
    note: string;
    createdBy: string;
  }): Promise<EventEntity> {
    const db = await this.prisma.event.create({
      data: {
        babyId: event.babyId,
        type: event.type,
        occurredAt: event.occurredAt,
        note: event.note,
        createdBy: event.createdBy,
      },
    });
    return this.mapToEntity(db);
  }

  async update(
    id: string,
    event: {
      occurredAt?: Date;
      note?: string;
    },
  ): Promise<EventEntity> {
    const db = await this.prisma.event.update({
      where: { id },
      data: {
        occurredAt: event.occurredAt,
        note: event.note,
      },
    });
    return this.mapToEntity(db);
  }

  async findById(id: string): Promise<EventEntity | null> {
    const db = await this.prisma.event.findUnique({ where: { id } });
    if (!db) return null;
    return this.mapToEntity(db);
  }

  async findByBaby(babyId: string, filter: ListEventsFilter): Promise<EventTimelinePage> {
    const pageSize = filter.limit ?? 20;
    const db = await this.prisma.event.findMany({
      where: {
        babyId,
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.search ? { note: { contains: filter.search, mode: 'insensitive' } } : {}),
        ...(filter.from || filter.to
          ? {
              occurredAt: {
                ...(filter.from ? { gte: filter.from } : {}),
                ...(filter.to ? { lte: filter.to } : {}),
              },
            }
          : {}),
      },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      ...(filter.cursor ? { cursor: { id: filter.cursor }, skip: 1 } : {}),
      take: pageSize + 1,
    });
    const hasNextPage = db.length > pageSize;
    const items = db.slice(0, pageSize).map((event) => this.mapToEntity(event));
    return {
      items,
      nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}
