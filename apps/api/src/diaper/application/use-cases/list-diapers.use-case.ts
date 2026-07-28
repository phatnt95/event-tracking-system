import { Injectable, Inject } from '@nestjs/common';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { DiaperResponse, DiaperStatus } from '@baby-tracker/shared-types';
import { ListDiapersQueryDto } from '../dtos/list-diapers-query.dto';

@Injectable()
export class ListDiapersUseCase {
  constructor(
    @Inject('IDiaperEventRepository')
    private readonly diaperEventRepository: IDiaperEventRepository,
  ) {}

  async execute(
    babyId: string,
    query?: ListDiapersQueryDto,
  ): Promise<DiaperResponse[]> {
    let diapers = await this.diaperEventRepository.findAllByBabyId(babyId);

    // Apply filters in memory
    if (query) {
      if (query.status) {
        diapers = diapers.filter(
          (d) => d.status === (query.status as DiaperStatus),
        );
      }
      if (query.startDate) {
        const start = new Date(query.startDate).getTime();
        diapers = diapers.filter((d) => d.event!.occurredAt.getTime() >= start);
      }
      if (query.endDate) {
        const end = new Date(query.endDate).getTime();
        diapers = diapers.filter((d) => d.event!.occurredAt.getTime() <= end);
      }
    }

    return diapers.map((diaperEvent) => {
      const baseEvent = diaperEvent.event!;
      return {
        id: baseEvent.id,
        eventId: baseEvent.id,
        babyId: baseEvent.babyId,
        type: baseEvent.type,
        occurredAt: baseEvent.occurredAt.toISOString(),
        note: baseEvent.note,
        createdBy: baseEvent.createdBy,
        createdAt: baseEvent.createdAt.toISOString(),
        updatedAt: baseEvent.updatedAt.toISOString(),
        status: diaperEvent.status,
        poopColor: diaperEvent.poopColor,
        poopConsistency: diaperEvent.poopConsistency,
        poopAmount: diaperEvent.poopAmount,
        hasBlood: diaperEvent.hasBlood,
        hasMucus: diaperEvent.hasMucus,
      };
    });
  }
}
