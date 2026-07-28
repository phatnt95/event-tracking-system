import { Test, TestingModule } from '@nestjs/testing';
import { GetFeedUseCase } from './get-feed.use-case';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, FeedType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { FeedNotFoundException } from '../../domain/errors/feed.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';
import { Event } from '../../../events/domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('GetFeedUseCase', () => {
  let useCase: GetFeedUseCase;
  let feedRepo: jest.Mocked<IFeedEventRepository>;
  let babyRepo: jest.Mocked<IBabyRepository>;

  const mockOwnerId = 'user-123';
  const mockBabyId = 'baby-456';
  const mockEventId = 'event-789';

  const mockBaby = new Baby(
    mockBabyId,
    mockOwnerId,
    'Baby Liam',
    'Lily',
    Gender.MALE,
    new Date('2026-01-01'),
    3.5,
    50,
    'Healthy baby',
    false,
    new Date(),
    new Date(),
  );

  const mockBaseEvent = new Event(
    mockEventId,
    mockBabyId,
    EventType.FEED,
    new Date('2026-07-27T10:00:00.000Z'),
    'Formula feed',
    mockOwnerId,
    new Date('2026-07-27T10:00:05.000Z'),
    new Date('2026-07-27T10:00:05.000Z'),
  );

  const mockFeed = new FeedEvent(
    'feed-101',
    mockEventId,
    mockBaseEvent,
    FeedType.FORMULA,
    null,
    null,
    150,
    120,
    'Enfamil A+',
    'Stage 1',
    new Date('2026-07-27T10:00:05.000Z'),
    new Date('2026-07-27T10:00:05.000Z'),
  );

  beforeEach(async () => {
    const mockFeedRepoProvider = {
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
        GetFeedUseCase,
        { provide: IFeedEventRepository, useValue: mockFeedRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<GetFeedUseCase>(GetFeedUseCase);
    feedRepo = module.get(IFeedEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should return feed event successfully', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(mockFeed);

    const result = await useCase.execute(mockBabyId, mockEventId, mockOwnerId);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(feedRepo.findById).toHaveBeenCalledWith(mockEventId);
    expect(result.id).toBe(mockEventId);
    expect(result.feedType).toBe(FeedType.FORMULA);
  });

  it('should throw BabyNotFoundException when baby does not exist', async () => {
    babyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(feedRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller does not own baby', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(feedRepo.findById).not.toHaveBeenCalled();
  });

  it('should throw FeedNotFoundException when feed event is not found', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockEventId, mockOwnerId)).rejects.toThrow(
      FeedNotFoundException,
    );
  });
});
