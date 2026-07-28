import { CreateDiaperUseCase } from './create-diaper.use-case';
import { CreateDiaperDto } from '../dtos/create-diaper.dto';
import { DiaperStatus, EventType, PoopColor, PoopConsistency, PoopAmount } from '@baby-tracker/shared-types';
import { InvalidDiaperConfigurationException } from '../../domain/errors/diaper.errors';

describe('CreateDiaperUseCase', () => {
  let useCase: CreateDiaperUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
    };
    useCase = new CreateDiaperUseCase(mockRepo);
  });

  it('should create a diaper event successfully (POOP)', async () => {
    const dto: CreateDiaperDto = {
      status: DiaperStatus.POOP,
      occurredAt: new Date().toISOString(),
      poopColor: PoopColor.BROWN,
      poopConsistency: PoopConsistency.SOFT,
      poopAmount: PoopAmount.MEDIUM,
      hasBlood: false,
      hasMucus: false,
    };

    const mockEvent = {
      id: 'event-1',
      babyId: 'baby-1',
      type: EventType.DIAPER,
      occurredAt: new Date(dto.occurredAt),
      note: '',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDiaper = {
      id: 'diaper-1',
      eventId: 'event-1',
      status: DiaperStatus.POOP,
      poopColor: PoopColor.BROWN,
      poopConsistency: PoopConsistency.SOFT,
      poopAmount: PoopAmount.MEDIUM,
      hasBlood: false,
      hasMucus: false,
      event: mockEvent,
    };

    mockRepo.create.mockResolvedValue(mockDiaper);

    const result = await useCase.execute('baby-1', 'user-1', dto);

    expect(result.eventId).toBe('event-1');
    expect(result.status).toBe(DiaperStatus.POOP);
    expect(result.poopColor).toBe(PoopColor.BROWN);
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('should throw InvalidDiaperConfigurationException if PEE has poop properties', async () => {
    const dto: CreateDiaperDto = {
      status: DiaperStatus.PEE,
      occurredAt: new Date().toISOString(),
      poopColor: PoopColor.YELLOW,
    };

    await expect(useCase.execute('baby-1', 'user-1', dto)).rejects.toThrow(
      InvalidDiaperConfigurationException,
    );
  });
});
