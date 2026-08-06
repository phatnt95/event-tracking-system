import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';
import { CreateGrowthDto } from '../dtos/create-growth.dto';
import { GrowthResponse, EventType } from '@baby-tracker/shared-types';

@Injectable()
export class CreateGrowthUseCase {
  constructor(
    @Inject(IGrowthEventRepository)
    private readonly growthRepo: IGrowthEventRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string, dto: CreateGrowthDto): Promise<GrowthResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new BabyNotFoundException(babyId);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    if (dto.weightKg <= 0) {
      throw new BadRequestException('Weight must be greater than 0 kg');
    }

    const measuredDate = new Date(dto.occurredAt);
    const now = new Date();
    if (measuredDate > now) {
      throw new BadRequestException('Measurement date cannot be in the future');
    }

    const birthDate = new Date(baby.birthday);
    if (measuredDate < birthDate) {
      throw new BadRequestException('Measurement date cannot be before birth date');
    }

    const growth = await this.growthRepo.create({
      babyId,
      weightKg: dto.weightKg,
      occurredAt: measuredDate,
      createdBy: ownerId,
      note: dto.note,
      heightCm: dto.heightCm,
      headCircumferenceCm: dto.headCircumferenceCm,
      measuredBy: dto.measuredBy,
      location: dto.location,
    });

    const ageWeeks = Math.max(
      0,
      Math.floor((measuredDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)),
    );

    const event = growth.event!;

    return {
      id: growth.id,
      eventId: growth.eventId,
      babyId: event.babyId,
      type: EventType.GROWTH,
      weightKg: growth.weightKg,
      measuredAt: event.occurredAt.toISOString(),
      occurredAt: event.occurredAt.toISOString(),
      ageWeeks,
      note: event.note,
      createdBy: event.createdBy,
      heightCm: growth.heightCm,
      headCircumferenceCm: growth.headCircumferenceCm,
      measuredBy: growth.measuredBy,
      location: growth.location,
      createdAt: growth.createdAt.toISOString(),
      updatedAt: growth.updatedAt.toISOString(),
    };
  }
}
