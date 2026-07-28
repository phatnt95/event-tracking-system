import { Test, TestingModule } from '@nestjs/testing';
import { ListFeedsUseCase } from './list-feeds.use-case';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, FeedType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';
import { Event } from '../../../events/domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('ListFeedsUseCase', () => {
  let useCase: ListFeedsUseCase;
  let feedRepo: jest.Mocked<IFeedEventRepository>;
  let babyRepo: jest.Mocked<IBabyRepository>;

  const mockOwnerId = 'user-123';
  const mockBabyId = 'baby-456';

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

  const mockFeeds = [
    new FeedEvent(
      'feed-1',
      'event-1',
      new Event(
        'event-1',
        mockBabyId,
        EventType.FEED,
        new Date('2026-07-27T08:00:00.000Z'),
        'Feed 1',
        mockOwnerId,
        new Date(),
        new Date(),
      ),
      FeedType.BREASTFEEDING,
      12,
      10,
    ),
  ];

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
        ListFeedsUseCase,
        { provide: IFeedEventRepository, useValue: mockFeedRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<ListFeedsUseCase>(ListFeedsUseCase);
    feedRepo = module.get(IFeedEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should return list of feeds for baby', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findByBaby.mockResolvedValue(mockFeeds);

    const query = { feedType: FeedType.BREASTFEEDING };
    const result = await useCase.execute(mockBabyId, mockOwnerId, query);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(feedRepo.findByBaby).toHaveBeenCalledWith(mockBabyId, {
      feedType: FeedType.BREASTFEEDING,
      from: undefined,
      to: undefined,
      limit: 50,
    });
    expect(result.length).toBe(1);
    expect(result[0].leftDuration).toBe(12);
  });

  it('should throw BabyNotFoundException when baby is missing', async () => {
    babyRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(mockBabyId, mockOwnerId, {})).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(feedRepo.findByBaby).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller does not own baby', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    await expect(useCase.execute(mockBabyId, mockOwnerId, {})).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(feedRepo.findByBaby).not.toHaveBeenCalled();
  });
});
