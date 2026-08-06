import { CreateGrowthUseCase } from './create-growth.use-case';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { IGrowthEventRepository } from '../../domain/repositories/growth-event.repository.interface';
import { EventType, Gender } from '@baby-tracker/shared-types';

describe('CreateGrowthUseCase', () => {
  let babyRepo: jest.Mocked<IBabyRepository>;
  let growthRepo: jest.Mocked<IGrowthEventRepository>;
  let useCase: CreateGrowthUseCase;

  beforeEach(() => {
    babyRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IBabyRepository>;

    growthRepo = {
      create: jest.fn(),
    } as unknown as jest.Mocked<IGrowthEventRepository>;

    useCase = new CreateGrowthUseCase(growthRepo, babyRepo);
  });

  it('creates growth record successfully', async () => {
    const birthday = new Date('2026-06-01T00:00:00.000Z');
    babyRepo.findById.mockResolvedValue({
      id: 'baby-1',
      ownerId: 'user-1',
      name: 'Baby John',
      nickname: null,
      gender: Gender.MALE,
      birthday,
      birthWeight: null,
      birthHeight: null,
      note: null,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const occurredAt = new Date('2026-08-01T00:00:00.000Z');
    growthRepo.create.mockResolvedValue({
      id: 'growth-1',
      eventId: 'event-1',
      weightKg: 5.2,
      createdAt: new Date(),
      updatedAt: new Date(),
      event: {
        id: 'event-1',
        babyId: 'baby-1',
        type: EventType.GROWTH,
        occurredAt,
        note: 'Healthy',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const result = await useCase.execute('baby-1', 'user-1', {
      weightKg: 5.2,
      occurredAt: occurredAt.toISOString(),
      note: 'Healthy',
    });

    expect(result.weightKg).toBe(5.2);
    expect(result.ageWeeks).toBe(8);
  });

  it('throws error if weight is <= 0', async () => {
    babyRepo.findById.mockResolvedValue({
      id: 'baby-1',
      ownerId: 'user-1',
      name: 'Baby John',
      nickname: null,
      gender: Gender.MALE,
      birthday: new Date('2026-06-01'),
      birthWeight: null,
      birthHeight: null,
      note: null,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute('baby-1', 'user-1', {
        weightKg: 0,
        occurredAt: new Date().toISOString(),
      }),
    ).rejects.toThrow('Weight must be greater than 0 kg');
  });
});
