import { Inject, Injectable } from '@nestjs/common';
import { UpdateBabyDto } from '../dtos/update-baby.dto';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { BabyResponse } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../domain/errors/baby.errors';

@Injectable()
export class UpdateBabyUseCase {
  constructor(
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(id: string, ownerId: string, dto: UpdateBabyDto): Promise<BabyResponse> {
    const baby = await this.babyRepo.findById(id);
    if (!baby) {
      throw new BabyNotFoundException(id);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    const updated = await this.babyRepo.update(id, {
      name: dto.name,
      nickname: dto.nickname,
      gender: dto.gender,
      birthday: dto.birthday ? new Date(dto.birthday) : undefined,
      birthWeight: dto.birthWeight,
      birthHeight: dto.birthHeight,
      note: dto.note,
    });

    return {
      id: updated.id,
      ownerId: updated.ownerId,
      name: updated.name,
      nickname: updated.nickname,
      gender: updated.gender,
      birthday: updated.birthday.toISOString(),
      birthWeight: updated.birthWeight,
      birthHeight: updated.birthHeight,
      note: updated.note,
      archived: updated.archived,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
