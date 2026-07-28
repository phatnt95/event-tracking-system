import { Injectable, Inject } from '@nestjs/common';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { CreateDiaperDto } from '../dtos/create-diaper.dto';
import { DiaperResponse, EventType, DiaperStatus } from '@baby-tracker/shared-types';
import { InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';

@Injectable()
export class CreateDiaperUseCase {
  constructor(
    @Inject('IDiaperEventRepository')
    private readonly diaperEventRepository: IDiaperEventRepository,
  ) {}

  async execute(
    babyId: string,
    userId: string,
    dto: CreateDiaperDto,
  ): Promise<DiaperResponse> {
    // Validate configuration: if status is PEE, poop fields shouldn't be set
    if (dto.status === DiaperStatus.PEE) {
      if (dto.poopColor || dto.poopConsistency || dto.poopAmount) {
        throw new InvalidDiaperConfigurationException(
          'Poop properties cannot be set for a PEE diaper event.',
        );
      }
    }

    const eventData = {
      babyId,
      type: EventType.DIAPER,
      occurredAt: new Date(dto.occurredAt),
      note: dto.note || '',
      createdBy: userId,
    };

    const diaperEvent = await this.diaperEventRepository.create(dto, eventData);
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
  }
}
