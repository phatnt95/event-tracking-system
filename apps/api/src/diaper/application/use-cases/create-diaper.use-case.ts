import { Inject, Injectable } from '@nestjs/common';
import { DiaperResponse, DiaperStatus } from '@baby-tracker/shared-types';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { CreateDiaperDto } from '../dtos/create-diaper.dto';
import { DiaperEvent } from '../../domain/entities/diaper-event.entity';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';

@Injectable()
export class CreateDiaperUseCase {
  constructor(
    @Inject(IDiaperEventRepository)
    private readonly diaperRepo: IDiaperEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string, dto: CreateDiaperDto): Promise<DiaperResponse> {
    await this.assertBabyAccess(babyId, ownerId);
    this.assertValidConfiguration(dto.status, dto);

    const diaper = await this.diaperRepo.create({
      babyId,
      createdBy: ownerId,
      occurredAt: new Date(dto.occurredAt),
      note: dto.note,
      status: dto.status,
      poopColor: dto.poopColor,
      poopConsistency: dto.poopConsistency,
      poopAmount: dto.poopAmount,
      hasBlood: dto.hasBlood,
      hasMucus: dto.hasMucus,
    });

    return this.toResponse(diaper);
  }

  private async assertBabyAccess(babyId: string, ownerId: string): Promise<void> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) throw new BabyNotFoundException(babyId);
    if (baby.ownerId !== ownerId) throw new ForbiddenBabyAccessException();
  }

  private assertValidConfiguration(status: DiaperStatus, dto: CreateDiaperDto): void {
    if (
      status === DiaperStatus.PEE &&
      (dto.poopColor || dto.poopConsistency || dto.poopAmount || dto.hasBlood || dto.hasMucus)
    ) {
      throw new InvalidDiaperConfigurationException(
        'Poop details, blood, and mucus cannot be set for a PEE diaper event.',
      );
    }
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
