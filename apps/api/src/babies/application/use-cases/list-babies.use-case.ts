import { Inject, Injectable } from '@nestjs/common';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { BabyResponse } from '@baby-tracker/shared-types';

@Injectable()
export class ListBabiesUseCase {
  constructor(
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(ownerId: string): Promise<BabyResponse[]> {
    const babies = await this.babyRepo.findByOwner(ownerId);

    return babies.map((baby) => ({
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
    }));
  }
}
