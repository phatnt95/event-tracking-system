import { DeleteDiaperUseCase } from './delete-diaper.use-case';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';

describe('DeleteDiaperUseCase', () => {
  let useCase: DeleteDiaperUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEventId: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteDiaperUseCase(mockRepo);
  });

  it('should delete diaper successfully', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      event: {
        id: 'event-1',
        babyId: 'baby-1',
      },
    };

    mockRepo.findByEventId.mockResolvedValue(mockDiaper);

    await useCase.execute('event-1', 'baby-1');

    expect(mockRepo.delete).toHaveBeenCalledWith('diaper-1');
  });

  it('should throw DiaperNotFoundException if not found', async () => {
    mockRepo.findByEventId.mockResolvedValue(null);

    await expect(useCase.execute('event-1', 'baby-1')).rejects.toThrow(
      DiaperNotFoundException,
    );
  });
});
