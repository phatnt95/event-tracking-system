import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateFeedParams,
  IFeedEventRepository,
  ListFeedsFilter,
  UpdateFeedParams,
} from '../../domain/repositories/feed-event.repository.interface';
import { FeedEvent } from '../../domain/entities/feed-event.entity';
import { Event as EventEntity } from '../../../events/domain/entities/event.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventType, FeedType } from '@baby-tracker/shared-types';

type DbFeedWithEvent = Prisma.FeedEventGetPayload<{ include: { event: true } }>;

@Injectable()
export class PrismaFeedEventRepository implements IFeedEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(dbFeed: DbFeedWithEvent): FeedEvent {
    const baseEvent = new EventEntity(
      dbFeed.event.id,
      dbFeed.event.babyId,
      dbFeed.event.type as EventType,
      dbFeed.event.occurredAt,
      dbFeed.event.note,
      dbFeed.event.createdBy,
      dbFeed.event.createdAt,
      dbFeed.event.updatedAt,
    );

    return new FeedEvent(
      dbFeed.id,
      dbFeed.eventId,
      baseEvent,
      dbFeed.feedType as FeedType,
      dbFeed.leftDuration,
      dbFeed.rightDuration,
      dbFeed.preparedVolume,
      dbFeed.consumedVolume,
      dbFeed.brand,
      dbFeed.stage,
      dbFeed.createdAt,
      dbFeed.updatedAt,
    );
  }

  async create(params: CreateFeedParams): Promise<FeedEvent> {
    const dbFeed = await this.prisma.feedEvent.create({
      data: {
        feedType: params.feedType,
        leftDuration: params.leftDuration,
        rightDuration: params.rightDuration,
        preparedVolume: params.preparedVolume,
        consumedVolume: params.consumedVolume,
        brand: params.brand,
        stage: params.stage,
        event: {
          create: {
            babyId: params.babyId,
            type: EventType.FEED,
            occurredAt: params.occurredAt,
            note: params.note ?? '',
            createdBy: params.createdBy,
          },
        },
      },
      include: {
        event: true,
      },
    });

    return this.mapToEntity(dbFeed);
  }

  async update(eventId: string, params: UpdateFeedParams): Promise<FeedEvent> {
    const dbFeed = await this.prisma.feedEvent.update({
      where: { eventId },
      data: {
        feedType: params.feedType,
        leftDuration: params.leftDuration,
        rightDuration: params.rightDuration,
        preparedVolume: params.preparedVolume,
        consumedVolume: params.consumedVolume,
        brand: params.brand,
        stage: params.stage,
        event: {
          update: {
            occurredAt: params.occurredAt,
            note: params.note,
          },
        },
      },
      include: {
        event: true,
      },
    });

    return this.mapToEntity(dbFeed);
  }

  async findById(eventId: string): Promise<FeedEvent | null> {
    const dbFeed = await this.prisma.feedEvent.findUnique({
      where: { eventId },
      include: { event: true },
    });

    if (!dbFeed) return null;
    return this.mapToEntity(dbFeed);
  }

  async findByBaby(babyId: string, filter?: ListFeedsFilter): Promise<FeedEvent[]> {
    const dbFeeds = await this.prisma.feedEvent.findMany({
      where: {
        event: {
          babyId,
          type: EventType.FEED,
          ...(filter?.from || filter?.to
            ? {
                occurredAt: {
                  ...(filter.from ? { gte: filter.from } : {}),
                  ...(filter.to ? { lte: filter.to } : {}),
                },
              }
            : {}),
        },
        ...(filter?.feedType ? { feedType: filter.feedType } : {}),
      },
      include: { event: true },
      orderBy: { event: { occurredAt: 'desc' } },
      take: filter?.limit ?? 50,
    });

    return dbFeeds.map((f) => this.mapToEntity(f));
  }

  async delete(eventId: string): Promise<void> {
    await this.prisma.event.delete({ where: { id: eventId } });
  }
}
