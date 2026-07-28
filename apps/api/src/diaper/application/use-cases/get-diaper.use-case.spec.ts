import { GetDiaperUseCase } from './get-diaper.use-case';
import { DiaperStatus, EventType } from '@baby-tracker/shared-types';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';

describe('GetDiaperUseCase', () => {
  it('returns an owned diaper event', async () => {
    const date = new Date();
    const diaperRepo = {
      findByEventId: jest
        .fn()
        .mockResolvedValue({
          eventId: 'event-1',
          status: DiaperStatus.PEE,
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
        }),
    };
    const useCase = new GetDiaperUseCase(
      diaperRepo as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await expect(useCase.execute('baby-1', 'event-1', 'user-1')).resolves.toMatchObject({
      eventId: 'event-1',
      status: DiaperStatus.PEE,
    });
  });

  it('does not reveal a diaper from another baby', async () => {
    const useCase = new GetDiaperUseCase(
      { findByEventId: jest.fn().mockResolvedValue({ event: { babyId: 'baby-2' } }) } as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await expect(useCase.execute('baby-1', 'event-1', 'user-1')).rejects.toThrow(
      DiaperNotFoundException,
    );
  });
});
