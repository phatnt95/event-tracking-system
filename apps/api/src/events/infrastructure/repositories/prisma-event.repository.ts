/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  IEventRepository,
  ListEventsFilter,
} from '../../domain/repositories/event.repository.interface';
import { Event as EventEntity } from '../../domain/entities/event.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventType } from '@baby-tracker/shared-types';

@Injectable()
export class PrismaEventRepository implements IEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(db: any): EventEntity {
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

  async findByBaby(babyId: string, filter: ListEventsFilter): Promise<EventEntity[]> {
    const db = await this.prisma.event.findMany({
      where: {
        babyId,
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.from || filter.to
          ? {
              occurredAt: {
                ...(filter.from ? { gte: filter.from } : {}),
                ...(filter.to ? { lte: filter.to } : {}),
              },
            }
          : {}),
      },
      orderBy: { occurredAt: 'desc' },
      take: filter.limit ?? 50,
    });
    return db.map((e) => this.mapToEntity(e));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.event.delete({ where: { id } });
  }
}
