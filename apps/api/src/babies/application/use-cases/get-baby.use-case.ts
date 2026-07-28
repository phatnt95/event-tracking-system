import { Inject, Injectable } from '@nestjs/common';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { BabyResponse } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../domain/errors/baby.errors';

@Injectable()
export class GetBabyUseCase {
  constructor(
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(id: string, ownerId: string): Promise<BabyResponse> {
    const baby = await this.babyRepo.findById(id);
    if (!baby) {
      throw new BabyNotFoundException(id);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    return {
      id: baby.id,
      ownerId: baby.ownerId,
      name: baby.name,
      nickname: baby.nickname,
      gender: baby.gender,
      birthday: baby.birthday.toISOString(),
      birthWeight: baby.birthWeight,
      birthHeight: baby.birthHeight,
      note: baby.note,
      archived: baby.archived,
      createdAt: baby.createdAt.toISOString(),
      updatedAt: baby.updatedAt.toISOString(),
    };
  }
}
