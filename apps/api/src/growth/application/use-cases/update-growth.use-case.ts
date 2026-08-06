import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { ForbiddenBabyAccessException } from '../../../babies/domain/errors/baby.errors';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';
import { UpdateGrowthDto } from '../dtos/update-growth.dto';
import { GrowthResponse, EventType } from '@baby-tracker/shared-types';

@Injectable()
export class UpdateGrowthUseCase {
  constructor(
    @Inject(IGrowthEventRepository)
    private readonly growthRepo: IGrowthEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(id: string, ownerId: string, dto: UpdateGrowthDto): Promise<GrowthResponse> {
    const existing = await this.growthRepo.findByEventId(id);
    if (!existing) {
      throw new NotFoundException('Growth record not found');
    }

    const baby = await this.babyRepo.findById(existing.event!.babyId);
    if (!baby || baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    if (dto.weightKg !== undefined && dto.weightKg <= 0) {
      throw new BadRequestException('Weight must be greater than 0 kg');
    }

    let occurredAt: Date | undefined;
    if (dto.occurredAt !== undefined) {
      occurredAt = new Date(dto.occurredAt);
      const now = new Date();
      if (occurredAt > now) {
        throw new BadRequestException('Measurement date cannot be in the future');
      }

      const birthDate = new Date(baby.birthday);
      if (occurredAt < birthDate) {
        throw new BadRequestException('Measurement date cannot be before birth date');
      }
    }

    const updated = await this.growthRepo.update(existing.eventId, {
      weightKg: dto.weightKg,
      occurredAt,
      note: dto.note,
      heightCm: dto.heightCm,
      headCircumferenceCm: dto.headCircumferenceCm,
      measuredBy: dto.measuredBy,
      location: dto.location,
    });

    const event = updated.event!;
    const birthDate = new Date(baby.birthday);
    const ageWeeks = Math.max(
      0,
      Math.floor((event.occurredAt.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)),
    );

    return {
      id: updated.id,
      eventId: updated.eventId,
      babyId: event.babyId,
      type: EventType.GROWTH,
      weightKg: updated.weightKg,
      measuredAt: event.occurredAt.toISOString(),
      occurredAt: event.occurredAt.toISOString(),
      ageWeeks,
      note: event.note,
      createdBy: event.createdBy,
      heightCm: updated.heightCm,
      headCircumferenceCm: updated.headCircumferenceCm,
      measuredBy: updated.measuredBy,
      location: updated.location,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
