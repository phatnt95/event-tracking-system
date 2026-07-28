import { Injectable, Inject } from '@nestjs/common';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { UpdateDiaperDto } from '../dtos/update-diaper.dto';
import { DiaperResponse, DiaperStatus } from '@baby-tracker/shared-types';
import {
  DiaperNotFoundException,
  InvalidDiaperConfigurationException,
} from '../../domain/errors/diaper.errors';

@Injectable()
export class UpdateDiaperUseCase {
  constructor(
    @Inject('IDiaperEventRepository')
    private readonly diaperEventRepository: IDiaperEventRepository,
  ) {}

  async execute(
    id: string,
    babyId: string,
    dto: UpdateDiaperDto,
  ): Promise<DiaperResponse> {
    const existing = await this.diaperEventRepository.findByEventId(id);

    if (!existing || !existing.event || existing.event.babyId !== babyId) {
      throw new DiaperNotFoundException();
    }

    const currentStatus = dto.status ?? existing.status;

    if (currentStatus === DiaperStatus.PEE) {
      const hasPoopProps =
        dto.poopColor ||
        dto.poopConsistency ||
        dto.poopAmount ||
        (dto.poopColor === undefined && existing.poopColor) ||
        (dto.poopConsistency === undefined && existing.poopConsistency) ||
        (dto.poopAmount === undefined && existing.poopAmount);

      if (hasPoopProps && (dto.poopColor !== null || dto.poopConsistency !== null || dto.poopAmount !== null)) {
         // If they change to PEE, we must clear the poop properties, or if they tried to set poop properties with PEE, throw error.
         if (dto.poopColor || dto.poopConsistency || dto.poopAmount) {
             throw new InvalidDiaperConfigurationException(
                'Poop properties cannot be set for a PEE diaper event.',
             );
         }
      }
    }

    let eventData: any = undefined;
    if (dto.occurredAt || dto.note !== undefined) {
      eventData = {};
      if (dto.occurredAt) eventData.occurredAt = new Date(dto.occurredAt);
      if (dto.note !== undefined) eventData.note = dto.note;
    }

    // Force clear poop props if changed to PEE and didn't throw
    const updateData = { ...dto };
    if (updateData.status === DiaperStatus.PEE) {
        updateData.poopColor = null as any;
        updateData.poopConsistency = null as any;
        updateData.poopAmount = null as any;
    }

    const updated = await this.diaperEventRepository.update(
      existing.id,
      updateData,
      eventData,
    );

    const baseEvent = updated.event!;

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
      status: updated.status,
      poopColor: updated.poopColor,
      poopConsistency: updated.poopConsistency,
      poopAmount: updated.poopAmount,
      hasBlood: updated.hasBlood,
      hasMucus: updated.hasMucus,
    };
  }
}
