import { Test, TestingModule } from '@nestjs/testing';
import { CreateEventUseCase } from './create-event.use-case';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { Event } from '../../domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('CreateEventUseCase', () => {
  let useCase: CreateEventUseCase;
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

  const mockCreatedEvent = new Event(
    'event-789',
    mockBabyId,
    EventType.FEED,
    new Date('2026-07-27T10:00:00.000Z'),
    'Morning feed',
    mockOwnerId,
    new Date('2026-07-27T10:00:05.000Z'),
    new Date('2026-07-27T10:00:05.000Z'),
  );

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
        CreateEventUseCase,
        { provide: IEventRepository, useValue: mockEventRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<CreateEventUseCase>(CreateEventUseCase);
    eventRepo = module.get(IEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should successfully create an event when baby exists and caller is owner', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.create.mockResolvedValue(mockCreatedEvent);

    const dto = {
      type: EventType.FEED,
      occurredAt: '2026-07-27T10:00:00.000Z',
      note: 'Morning feed',
    };

    const result = await useCase.execute(mockBabyId, mockOwnerId, dto);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(eventRepo.create).toHaveBeenCalledWith({
      babyId: mockBabyId,
      type: EventType.FEED,
      occurredAt: new Date('2026-07-27T10:00:00.000Z'),
      note: 'Morning feed',
      createdBy: mockOwnerId,
    });
    expect(result).toEqual({
      id: 'event-789',
      babyId: mockBabyId,
      type: EventType.FEED,
      occurredAt: '2026-07-27T10:00:00.000Z',
      note: 'Morning feed',
      createdBy: mockOwnerId,
      createdAt: '2026-07-27T10:00:05.000Z',
      updatedAt: '2026-07-27T10:00:05.000Z',
    });
  });

  it('should throw BabyNotFoundException when baby is not found', async () => {
    babyRepo.findById.mockResolvedValue(null);

    const dto = {
      type: EventType.FEED,
      occurredAt: '2026-07-27T10:00:00.000Z',
    };

    await expect(useCase.execute(mockBabyId, mockOwnerId, dto)).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(eventRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller is not baby owner', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'different-user',
    });

    const dto = {
      type: EventType.FEED,
      occurredAt: '2026-07-27T10:00:00.000Z',
    };

    await expect(useCase.execute(mockBabyId, mockOwnerId, dto)).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(eventRepo.create).not.toHaveBeenCalled();
  });
});
