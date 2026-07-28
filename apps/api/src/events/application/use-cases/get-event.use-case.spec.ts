import { Test, TestingModule } from '@nestjs/testing';
import { GetEventUseCase } from './get-event.use-case';
import { IEventRepository } from '../../domain/repositories/event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { EventNotFoundException } from '../../domain/errors/event.errors';
import { Event } from '../../domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('GetEventUseCase', () => {
  let useCase: GetEventUseCase;
  let eventRepo: jest.Mocked<IEventRepository>;
  let babyRepo: jest.Mocked<IBabyRepository>;

  const mockOwnerId = 'user-123';
  const mockBabyId = 'baby-456';
  const mockEventId = 'event-789';

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

  const mockEvent = new Event(
    mockEventId,
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
        GetEventUseCase,
        { provide: IEventRepository, useValue: mockEventRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<GetEventUseCase>(GetEventUseCase);
    eventRepo = module.get(IEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should return event details successfully', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findById.mockResolvedValue(mockEvent);

    const result = await useCase.execute(mockBabyId, mockEventId, mockOwnerId);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(eventRepo.findById).toHaveBeenCalledWith(mockEventId);
    expect(result).toEqual({
      id: mockEventId,
      babyId: mockBabyId,
      type: EventType.FEED,
      occurredAt: '2026-07-27T10:00:00.000Z',
      note: 'Morning feed',
      createdBy: mockOwnerId,
      createdAt: '2026-07-27T10:00:05.000Z',
      updatedAt: '2026-07-27T10:00:05.000Z',
    });
  });

  it('should throw BabyNotFoundException when baby does not exist', async () => {
    babyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(eventRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller does not own baby', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(eventRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw EventNotFoundException when event does not exist', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      EventNotFoundException,
    );
  });

  it('should throw EventNotFoundException when event babyId mismatches requested babyId', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findById.mockResolvedValue(
      new Event(
        mockEventId,
        'other-baby-id',
        EventType.FEED,
        new Date(),
        '',
        mockOwnerId,
        new Date(),
        new Date(),
      ),
    );

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      EventNotFoundException,
    );
  });
});
