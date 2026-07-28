import { Injectable, Inject } from '@nestjs/common';
import { IDiaperEventRepository } from '../../domain/repositories/diaper-event.repository.interface';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';

@Injectable()
export class DeleteDiaperUseCase {
  constructor(
    @Inject('IDiaperEventRepository')
    private readonly diaperEventRepository: IDiaperEventRepository,
  ) {}

  async execute(id: string, babyId: string): Promise<void> {
    const diaperEvent = await this.diaperEventRepository.findByEventId(id);

    if (!diaperEvent || !diaperEvent.event || diaperEvent.event.babyId !== babyId) {
      throw new DiaperNotFoundException();
    }

    await this.diaperEventRepository.delete(diaperEvent.id);
  }
}
