import { UpdateDiaperUseCase } from './update-diaper.use-case';
import { DiaperStatus, EventType, PoopColor } from '@baby-tracker/shared-types';
import { InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';

describe('UpdateDiaperUseCase', () => {
  const date = new Date();
  const existing = {
    eventId: 'event-1',
    status: DiaperStatus.POOP,
    poopColor: PoopColor.BROWN,
    hasBlood: false,
    hasMucus: false,
    event: {
      id: 'event-1',
      babyId: 'baby-1',
      type: EventType.DIAPER,
      occurredAt: date,
      note: '',
      createdBy: 'user-1',
      createdAt: date,
      updatedAt: date,
    },
  };

  it('clears poop details when changing to pee-only', async () => {
    const diaperRepo = {
      findByEventId: jest.fn().mockResolvedValue(existing),
      update: jest
        .fn()
        .mockResolvedValue({ ...existing, status: DiaperStatus.PEE, poopColor: null }),
    };
    const useCase = new UpdateDiaperUseCase(
      diaperRepo as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await useCase.execute('baby-1', 'event-1', 'user-1', { status: DiaperStatus.PEE });
    expect(diaperRepo.update).toHaveBeenCalledWith(
      'event-1',
      expect.objectContaining({ status: DiaperStatus.PEE, poopColor: null, hasBlood: false }),
    );
  });

  it('rejects poop details for an effective pee-only status', async () => {
    const diaperRepo = {
      findByEventId: jest.fn().mockResolvedValue({ ...existing, status: DiaperStatus.PEE }),
    };
    const useCase = new UpdateDiaperUseCase(
      diaperRepo as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await expect(
      useCase.execute('baby-1', 'event-1', 'user-1', { poopColor: PoopColor.BROWN }),
    ).rejects.toThrow(InvalidDiaperConfigurationException);
  });
});
