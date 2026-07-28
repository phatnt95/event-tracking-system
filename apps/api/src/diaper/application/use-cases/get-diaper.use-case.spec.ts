import { GetDiaperUseCase } from './get-diaper.use-case';
import { DiaperNotFoundException } from '../../domain/errors/diaper.errors';
import { DiaperStatus, EventType } from '@baby-tracker/shared-types';

describe('GetDiaperUseCase', () => {
  let useCase: GetDiaperUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEventId: jest.fn(),
    };
    useCase = new GetDiaperUseCase(mockRepo);
  });

  it('should return diaper event successfully', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.PEE,
      hasBlood: false,
      hasMucus: false,
      event: {
        id: 'event-1',
        babyId: 'baby-1',
        type: EventType.DIAPER,
        occurredAt: new Date(),
        note: '',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockRepo.findByEventId.mockResolvedValue(mockDiaper);

    const result = await useCase.execute('event-1', 'baby-1');

    expect(result.eventId).toBe('event-1');
    expect(result.status).toBe(DiaperStatus.PEE);
  });

  it('should throw DiaperNotFoundException if not found', async () => {
    mockRepo.findByEventId.mockResolvedValue(null);

    await expect(useCase.execute('event-1', 'baby-1')).rejects.toThrow(
      DiaperNotFoundException,
    );
  });

  it('should throw DiaperNotFoundException if babyId mismatch', async () => {
    const mockDiaper = {
      event: { babyId: 'baby-2' },
    };
    mockRepo.findByEventId.mockResolvedValue(mockDiaper);

    await expect(useCase.execute('event-1', 'baby-1')).rejects.toThrow(
      DiaperNotFoundException,
    );
  });
});
