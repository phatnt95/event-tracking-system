import { DeleteDiaperUseCase } from './delete-diaper.use-case';

describe('DeleteDiaperUseCase', () => {
  it('deletes the base event after ownership checks', async () => {
    const diaperRepo = {
      findByEventId: jest.fn().mockResolvedValue({ event: { babyId: 'baby-1' } }),
      delete: jest.fn(),
    };
    const useCase = new DeleteDiaperUseCase(
      diaperRepo as any,
      { findById: jest.fn().mockResolvedValue({ ownerId: 'user-1' }) } as any,
    );
    await useCase.execute('baby-1', 'event-1', 'user-1');
    expect(diaperRepo.delete).toHaveBeenCalledWith('event-1');
  });
});
