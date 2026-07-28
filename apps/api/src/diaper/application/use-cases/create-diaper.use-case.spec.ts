import { CreateDiaperUseCase } from './create-diaper.use-case';
import { DiaperStatus, EventType, PoopColor } from '@baby-tracker/shared-types';
import { InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';

describe('CreateDiaperUseCase', () => {
  const baby = { id: 'baby-1', ownerId: 'user-1' } as any;
  let diaperRepo: any;
  let babyRepo: any;
  let useCase: CreateDiaperUseCase;

  beforeEach(() => {
    diaperRepo = { create: jest.fn() };
    babyRepo = { findById: jest.fn().mockResolvedValue(baby) };
    useCase = new CreateDiaperUseCase(diaperRepo, babyRepo);
  });

  it('creates a poop event for the baby owner', async () => {
    const occurredAt = new Date('2026-07-27T10:00:00.000Z');
    diaperRepo.create.mockResolvedValue({
      eventId: 'event-1',
      status: DiaperStatus.POOP,
      poopColor: PoopColor.BROWN,
      hasBlood: false,
      hasMucus: false,
      event: {
        id: 'event-1',
        babyId: 'baby-1',
        type: EventType.DIAPER,
        occurredAt,
        note: '',
        createdBy: 'user-1',
        createdAt: occurredAt,
        updatedAt: occurredAt,
      },
    });
    await expect(
      useCase.execute('baby-1', 'user-1', {
        status: DiaperStatus.POOP,
        occurredAt: occurredAt.toISOString(),
        poopColor: PoopColor.BROWN,
      }),
    ).resolves.toMatchObject({ eventId: 'event-1', poopColor: PoopColor.BROWN });
    expect(diaperRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ babyId: 'baby-1', createdBy: 'user-1' }),
    );
  });

  it('rejects poop details for a pee-only event', async () => {
    await expect(
      useCase.execute('baby-1', 'user-1', {
        status: DiaperStatus.PEE,
        occurredAt: new Date().toISOString(),
        poopColor: PoopColor.YELLOW,
      }),
    ).rejects.toThrow(InvalidDiaperConfigurationException);
  });
});
