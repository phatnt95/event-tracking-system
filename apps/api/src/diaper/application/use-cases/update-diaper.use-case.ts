import { Inject, Injectable } from '@nestjs/common';
import { DiaperResponse, DiaperStatus } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { UpdateDiaperDto } from '../dtos/update-diaper.dto';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';
import {
  DiaperNotFoundException,
  InvalidDiaperConfigurationException,
} from '../../domain/errors/diaper.errors';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';

@Injectable()
export class UpdateDiaperUseCase {
  constructor(
    @Inject(IDiaperEventRepository) private readonly diaperRepo: IDiaperEventRepository,
    @Inject(IBabyRepository) private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(
    babyId: string,
    eventId: string,
    ownerId: string,
    dto: UpdateDiaperDto,
  ): Promise<DiaperResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) throw new BabyNotFoundException(babyId);
    if (baby.ownerId !== ownerId) throw new ForbiddenBabyAccessException();

    const existing = await this.diaperRepo.findByEventId(eventId);
    if (!existing || existing.event?.babyId !== babyId) throw new DiaperNotFoundException(eventId);

    const status = dto.status ?? existing.status;
    const hasPoopData =
      dto.poopColor !== undefined ||
      dto.poopConsistency !== undefined ||
      dto.poopAmount !== undefined ||
      dto.hasBlood === true ||
      dto.hasMucus === true;
    if (status === DiaperStatus.PEE && hasPoopData) {
      throw new InvalidDiaperConfigurationException(
        'Poop details, blood, and mucus cannot be set for a PEE diaper event.',
      );
    }

    const updated = await this.diaperRepo.update(eventId, {
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
      note: dto.note,
      status: dto.status,
      poopColor: status === DiaperStatus.PEE ? null : dto.poopColor,
      poopConsistency: status === DiaperStatus.PEE ? null : dto.poopConsistency,
      poopAmount: status === DiaperStatus.PEE ? null : dto.poopAmount,
      hasBlood: status === DiaperStatus.PEE ? false : dto.hasBlood,
      hasMucus: status === DiaperStatus.PEE ? false : dto.hasMucus,
    });
    return this.toResponse(updated);
  }

  private toResponse(diaper: DiaperEvent): DiaperResponse {
    const event = diaper.event!;
    return {
      id: event.id,
      eventId: diaper.eventId,
      babyId: event.babyId,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      note: event.note,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      status: diaper.status,
      poopColor: diaper.poopColor,
      poopConsistency: diaper.poopConsistency,
      poopAmount: diaper.poopAmount,
      hasBlood: diaper.hasBlood,
      hasMucus: diaper.hasMucus,
    };
  }
}
