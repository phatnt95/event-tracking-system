import { Test, TestingModule } from '@nestjs/testing';
import { DeleteFeedUseCase } from './delete-feed.use-case';
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

describe('DeleteFeedUseCase', () => {
  let useCase: DeleteFeedUseCase;
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

  const mockFeed = new FeedEvent(
    'feed-101',
    mockEventId,
    new Event(
      mockEventId,
      mockBabyId,
      EventType.FEED,
      new Date('2026-07-27T10:00:00.000Z'),
      'Old note',
      mockOwnerId,
      new Date(),
      new Date(),
    ),
    FeedType.FORMULA,
    null,
    null,
    150,
    120,
    'Enfamil A+',
    'Stage 1',
    new Date(),
    new Date(),
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
        DeleteFeedUseCase,
        { provide: IFeedEventRepository, useValue: mockFeedRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<DeleteFeedUseCase>(DeleteFeedUseCase);
    feedRepo = module.get(IFeedEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should delete feed event successfully', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(mockFeed);
    feedRepo.delete.mockResolvedValue(undefined);

    await useCase.execute(mockBabyId, mockEventId, mockOwnerId);

    expect(feedRepo.delete).toHaveBeenCalledWith(mockEventId);
  });

  it('should throw FeedNotFoundException when feed event does not exist', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(mockBabyId, mockEventId, mockOwnerId),
    ).rejects.toThrow(FeedNotFoundException);

    expect(feedRepo.delete).not.toHaveBeenCalled();
  });
});
