import { Test, TestingModule } from '@nestjs/testing';
import { DeleteEventUseCase } from './delete-event.use-case';
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

describe('DeleteEventUseCase', () => {
  let useCase: DeleteEventUseCase;
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
    'Feed note',
    mockOwnerId,
    new Date('2026-07-27T10:00:00.000Z'),
    new Date('2026-07-27T10:00:00.000Z'),
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
        DeleteEventUseCase,
        { provide: IEventRepository, useValue: mockEventRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
    eventRepo = module.get(IEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should delete event successfully', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findById.mockResolvedValue(mockEvent);
    eventRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(mockBabyId, mockEventId, mockOwnerId);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(eventRepo.findById).toHaveBeenCalledWith(mockEventId);
    expect(eventRepo.delete).toHaveBeenCalledWith(mockEventId);
  });

  it('should throw BabyNotFoundException when baby does not exist', async () => {
    babyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      BabyNotFoundException,
    );

    expect(eventRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller does not own baby', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      ForbiddenBabyAccessException,
    );

    expect(eventRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw EventNotFoundException when event does not exist', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    eventRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      EventNotFoundException,
    );

    expect(eventRepo.delete).not.toHaveBeenCalled();
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

    expect(eventRepo.delete).not.toHaveBeenCalled();
  });
});
