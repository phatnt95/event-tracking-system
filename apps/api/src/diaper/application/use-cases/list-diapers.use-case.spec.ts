import { ListDiapersUseCase } from './list-diapers.use-case';
import { DiaperStatus, EventType } from '@baby-tracker/shared-types';

describe('ListDiapersUseCase', () => {
  let useCase: ListDiapersUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findAllByBabyId: jest.fn(),
    };
    useCase = new ListDiapersUseCase(mockRepo);
  });

  it('should list diapers successfully', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.POOP,
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

    mockRepo.findAllByBabyId.mockResolvedValue([mockDiaper]);

    const result = await useCase.execute('baby-1');

    expect(result.length).toBe(1);
    expect(result[0].eventId).toBe('event-1');
  });

  it('should filter by status', async () => {
    const mockDiaperPoop = {
      id: 'diaper-1',
      status: DiaperStatus.POOP,
      event: {
        occurredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    const mockDiaperPee = {
      id: 'diaper-2',
      status: DiaperStatus.PEE,
      event: {
        occurredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    mockRepo.findAllByBabyId.mockResolvedValue([mockDiaperPoop, mockDiaperPee]);

    const result = await useCase.execute('baby-1', { status: 'PEE' });

    expect(result.length).toBe(1);
    expect(result[0].status).toBe(DiaperStatus.PEE);
  });
});
