import { ListDiapersUseCase } from './list-diapers.use-case';
import { DiaperStatus, EventType } from '@baby-tracker/shared-types';

describe('ListDiapersUseCase', () => {
  it('scopes filters and records to the owned baby', async () => {
    const date = new Date();
    const diaperRepo = {
      findByBaby: jest
        .fn()
        .mockResolvedValue([
          {
            eventId: 'event-1',
            status: DiaperStatus.POOP,
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
          },
        ]),
    };
    const useCase = new ListDiapersUseCase(
      diaperRepo as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await expect(
      useCase.execute('baby-1', 'user-1', { status: DiaperStatus.POOP }),
    ).resolves.toHaveLength(1);
    expect(diaperRepo.findByBaby).toHaveBeenCalledWith(
      'baby-1',
      expect.objectContaining({ status: DiaperStatus.POOP, limit: 50 }),
    );
  });
});
