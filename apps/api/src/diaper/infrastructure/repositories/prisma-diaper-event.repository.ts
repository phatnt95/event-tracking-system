import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';

@Injectable()
export class PrismaDiaperEventRepository implements IDiaperEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(diaperData: any, eventData: any): Promise<DiaperEvent> {
    const result = await this.prisma.event.create({
      data: {
        ...eventData,
        diaperEvent: {
          create: {
            status: diaperData.status,
            poopColor: diaperData.poopColor,
            poopConsistency: diaperData.poopConsistency,
            poopAmount: diaperData.poopAmount,
            hasBlood: diaperData.hasBlood || false,
            hasMucus: diaperData.hasMucus || false,
          },
        },
      },
      include: {
        diaperEvent: true,
      },
    });

    return this.mapToEntity(result.diaperEvent!, result);
  }

  async findById(id: string): Promise<DiaperEvent | null> {
    const result = await this.prisma.diaperEvent.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!result) return null;
    return this.mapToEntity(result, result.event);
  }

  async findByEventId(eventId: string): Promise<DiaperEvent | null> {
    const result = await this.prisma.diaperEvent.findUnique({
      where: { eventId },
      include: { event: true },
    });

    if (!result) return null;
    return this.mapToEntity(result, result.event);
  }

  async findAllByBabyId(babyId: string): Promise<DiaperEvent[]> {
    const results = await this.prisma.diaperEvent.findMany({
      where: {
        event: { babyId },
      },
      include: { event: true },
      orderBy: {
        event: { occurredAt: 'desc' },
      },
    });

    return results.map((r: any) => this.mapToEntity(r, r.event));
  }

  async update(id: string, diaperData: any, eventData?: any): Promise<DiaperEvent> {
    const result = await this.prisma.diaperEvent.update({
      where: { id },
      data: {
        status: diaperData.status,
        poopColor: diaperData.poopColor,
        poopConsistency: diaperData.poopConsistency,
        poopAmount: diaperData.poopAmount,
        hasBlood: diaperData.hasBlood,
        hasMucus: diaperData.hasMucus,
        ...(eventData && {
          event: {
            update: eventData,
          },
        }),
      },
      include: { event: true },
    });

    return this.mapToEntity(result, result.event);
  }

  async delete(id: string): Promise<void> {
    // Delete the base event, which cascades to diaperEvent
    const diaper = await this.prisma.diaperEvent.findUnique({
      where: { id },
      select: { eventId: true },
    });
    
    if (diaper) {
      await this.prisma.event.delete({
        where: { id: diaper.eventId },
      });
    }
  }

  private mapToEntity(prismaDiaper: any, prismaEvent: any): DiaperEvent {
    return new DiaperEvent(
      prismaDiaper.id,
      prismaDiaper.eventId,
      prismaDiaper.status,
      prismaDiaper.hasBlood,
      prismaDiaper.hasMucus,
      prismaDiaper.createdAt,
      prismaDiaper.updatedAt,
      prismaDiaper.poopColor,
      prismaDiaper.poopConsistency,
      prismaDiaper.poopAmount,
      prismaEvent,
    );
  }
}
