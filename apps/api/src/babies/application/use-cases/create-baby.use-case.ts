import { Inject, Injectable } from '@nestjs/common';
import { CreateBabyDto } from '../dtos/create-baby.dto';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { BabyResponse } from '@baby-tracker/shared-types';

@Injectable()
export class CreateBabyUseCase {
  constructor(
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(ownerId: string, dto: CreateBabyDto): Promise<BabyResponse> {
    const baby = await this.babyRepo.create({
      ownerId,
      name: dto.name,
      nickname: dto.nickname ?? null,
      gender: dto.gender,
      birthday: new Date(dto.birthday),
      birthWeight: dto.birthWeight ?? null,
      birthHeight: dto.birthHeight ?? null,
      note: dto.note ?? null,
    });

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
