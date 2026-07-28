import { UpdateDiaperUseCase } from './update-diaper.use-case';
import { DiaperNotFoundException, InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';
import { DiaperStatus, EventType, PoopColor } from '@baby-tracker/shared-types';

describe('UpdateDiaperUseCase', () => {
  let useCase: UpdateDiaperUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEventId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateDiaperUseCase(mockRepo);
  });

  it('should update diaper successfully', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.PEE,
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
    mockRepo.update.mockResolvedValue({
      ...mockDiaper,
      status: DiaperStatus.BOTH,
      poopColor: PoopColor.BROWN,
    });

    const result = await useCase.execute('event-1', 'baby-1', {
      status: DiaperStatus.BOTH,
      poopColor: PoopColor.BROWN,
    });

    expect(result.status).toBe(DiaperStatus.BOTH);
    expect(result.poopColor).toBe(PoopColor.BROWN);
    expect(mockRepo.update).toHaveBeenCalled();
  });

  it('should clear poop props if changing to PEE', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.POOP,
      poopColor: PoopColor.BROWN,
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
    mockRepo.update.mockResolvedValue({
      ...mockDiaper,
      status: DiaperStatus.PEE,
      poopColor: null,
    });

    await useCase.execute('event-1', 'baby-1', { status: DiaperStatus.PEE });

    expect(mockRepo.update).toHaveBeenCalledWith('diaper-1', expect.objectContaining({
      status: DiaperStatus.PEE,
      poopColor: null,
    }), undefined);
  });

  it('should throw exception if explicitly setting poop props while status is PEE', async () => {
    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.PEE,
      event: {
        id: 'event-1',
        babyId: 'baby-1',
      },
    };

    mockRepo.findByEventId.mockResolvedValue(mockDiaper);

    await expect(
      useCase.execute('event-1', 'baby-1', { poopColor: PoopColor.BROWN })
    ).rejects.toThrow(InvalidDiaperConfigurationException);
  });
});
