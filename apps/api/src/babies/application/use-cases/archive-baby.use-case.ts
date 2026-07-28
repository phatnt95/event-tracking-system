import { Inject, Injectable } from '@nestjs/common';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../domain/errors/baby.errors';

@Injectable()
export class ArchiveBabyUseCase {
  constructor(
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(id: string, ownerId: string): Promise<void> {
    const baby = await this.babyRepo.findById(id);
    if (!baby) {
      throw new BabyNotFoundException(id);
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenBabyAccessException();
    }

    await this.babyRepo.archive(id);
  }
}
