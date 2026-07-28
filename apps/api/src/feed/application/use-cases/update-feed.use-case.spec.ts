import { Test, TestingModule } from '@nestjs/testing';
import { UpdateFeedUseCase } from './update-feed.use-case';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, FeedType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import {
  FeedNotFoundException,
  InvalidFeedVolumeException,
} from '../../domain/errors/feed.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';
import { Event } from '../../../events/domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('UpdateFeedUseCase', () => {
  let useCase: UpdateFeedUseCase;
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

  const mockExistingFeed = new FeedEvent(
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

  const mockUpdatedFeed = new FeedEvent(
    'feed-101',
    mockEventId,
    new Event(
      mockEventId,
      mockBabyId,
      EventType.FEED,
      new Date('2026-07-27T10:00:00.000Z'),
      'Updated note',
      mockOwnerId,
      new Date(),
      new Date(),
    ),
    FeedType.FORMULA,
    null,
    null,
    150,
    140,
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
        UpdateFeedUseCase,
        { provide: IFeedEventRepository, useValue: mockFeedRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<UpdateFeedUseCase>(UpdateFeedUseCase);
    feedRepo = module.get(IFeedEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should update feed event successfully', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(mockExistingFeed);
    feedRepo.update.mockResolvedValue(mockUpdatedFeed);

    const dto = {
      consumedVolume: 140,
      note: 'Updated note',
    };

    const result = await useCase.execute(mockBabyId, mockEventId, mockOwnerId, dto);

    expect(feedRepo.update).toHaveBeenCalledWith(mockEventId, {
      occurredAt: undefined,
      note: 'Updated note',
      feedType: undefined,
      leftDuration: undefined,
      rightDuration: undefined,
      preparedVolume: undefined,
      consumedVolume: 140,
      brand: undefined,
      stage: undefined,
    });
    expect(result.consumedVolume).toBe(140);
  });

  it('should throw InvalidFeedVolumeException when updated consumed volume > prepared volume', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(mockExistingFeed);

    const dto = { consumedVolume: 200 }; // prepared is 150

    await expect(
      useCase.execute(mockBabyId, mockEventId, mockOwnerId, dto),
    ).rejects.toThrow(InvalidFeedVolumeException);

    expect(feedRepo.update).not.toHaveBeenCalled();
  });

  it('should throw FeedNotFoundException when feed event does not exist', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(mockBabyId, mockEventId, mockOwnerId, {}),
    ).rejects.toThrow(FeedNotFoundException);
  });
});
