import { Test, TestingModule } from '@nestjs/testing';
import { ListEventsUseCase } from './list-events.use-case';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { Event } from '../../domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('ListEventsUseCase', () => {
  let useCase: ListEventsUseCase;
  let eventRepo: jest.Mocked<IEventRepository>;
  let babyRepo: jest.Mocked<IBabyRepository>;

  const mockOwnerId = 'user-123';
  const mockBabyId = 'baby-456';

  const mockBaby = new Baby(
    mockBabyId,
    mockOwnerId,
    'Baby John',
    'Johnny',
    Gender.MALE,
    new Date('2026-01-01'),
    3.5,
    50,
    'Healthy baby',
    false,
    new Date(),
    new Date(),
  );

  const mockEvents = [
    new Event(
      'event-1',
      mockBabyId,
      EventType.FEED,
      new Date('2026-07-27T10:00:00.000Z'),
      'Feed 1',
      mockOwnerId,
      new Date('2026-07-27T10:00:00.000Z'),
      new Date('2026-07-27T10:00:00.000Z'),
    ),
    new Event(
      'event-2',
      mockBabyId,
      EventType.DIAPER,
      new Date('2026-07-27T11:00:00.000Z'),
      'Diaper change',
      mockOwnerId,
      new Date('2026-07-27T11:00:00.000Z'),
      new Date('2026-07-27T11:00:00.000Z'),
    ),
  ];

  beforeEach(async () => {
    const mockEventRepoProvider = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByBaby: jest.fn(),
      delete: jest.fn(),
    };

    const mockBabyRepoProvider = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByOwner: jest.fn(),
      archive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListEventsUseCase,
        { provide: IEventRepository, useValue: mockEventRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<ListEventsUseCase>(ListEventsUseCase);
    eventRepo = module.get(IEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should list events with filters and default limit', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findByBaby.mockResolvedValue(mockEvents);

    const query = {
      type: EventType.FEED,
      from: '2026-07-27T00:00:00.000Z',
      to: '2026-07-27T23:59:59.000Z',
    };

    const result = await useCase.execute(mockBabyId, mockOwnerId, query);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(eventRepo.findByBaby).toHaveBeenCalledWith(mockBabyId, {
      type: EventType.FEED,
      from: new Date('2026-07-27T00:00:00.000Z'),
      to: new Date('2026-07-27T23:59:59.000Z'),
      limit: 50,
    });
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('event-1');
  });

  it('should respect custom limit in query', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findByBaby.mockResolvedValue([mockEvents[0]]);

    const query = { limit: 10 };
    await useCase.execute(mockBabyId, mockOwnerId, query);

    expect(eventRepo.findByBaby).toHaveBeenCalledWith(mockBabyId, {
      type: undefined,
      from: undefined,
      to: undefined,
      limit: 10,
    });
  });

  it('should throw BabyNotFoundException when baby is not found', async () => {
    babyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockOwnerId, {})).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(eventRepo.findByBaby).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller does not own baby', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    await expect(useCase.execute(mockBabyId, mockOwnerId, {})).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(eventRepo.findByBaby).not.toHaveBeenCalled();
  });
});
