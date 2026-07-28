import { Test, TestingModule } from '@nestjs/testing';
import { CreateFeedUseCase } from './create-feed.use-case';
import { IFeedEventRepository } from '../../domain/repositories/feed-event.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { EventType, FeedType, Gender } from '@baby-tracker/shared-types';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../../babies/domain/errors/baby.errors';
import { InvalidFeedVolumeException } from '../../domain/errors/feed.errors';
import { FeedEvent } from '../../domain/entities/feed-event.entity';
import { Event } from '../../../events/domain/entities/event.entity';
import { Baby } from '../../../babies/domain/entities/baby.entity';

describe('CreateFeedUseCase', () => {
  let useCase: CreateFeedUseCase;
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

  const mockBaseEvent = new Event(
    'event-789',
    mockBabyId,
    EventType.FEED,
    new Date('2026-07-27T10:00:00.000Z'),
    'Formula feed',
    mockOwnerId,
    new Date('2026-07-27T10:00:05.000Z'),
    new Date('2026-07-27T10:00:05.000Z'),
  );

  const mockCreatedFeed = new FeedEvent(
    'feed-101',
    'event-789',
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
        CreateFeedUseCase,
        { provide: IFeedEventRepository, useValue: mockFeedRepoProvider },
        { provide: IBabyRepository, useValue: mockBabyRepoProvider },
      ],
    }).compile();

    useCase = module.get<CreateFeedUseCase>(CreateFeedUseCase);
    feedRepo = module.get(IFeedEventRepository);
    babyRepo = module.get(IBabyRepository);
  });

  it('should successfully create a formula feed event', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);
    feedRepo.create.mockResolvedValue(mockCreatedFeed);

    const dto = {
      feedType: FeedType.FORMULA,
      occurredAt: '2026-07-27T10:00:00.000Z',
      note: 'Formula feed',
      preparedVolume: 150,
      consumedVolume: 120,
      brand: 'Enfamil A+',
      stage: 'Stage 1',
    };

    const result = await useCase.execute(mockBabyId, mockOwnerId, dto);

    expect(babyRepo.findById).toHaveBeenCalledWith(mockBabyId);
    expect(feedRepo.create).toHaveBeenCalledWith({
      babyId: mockBabyId,
      createdBy: mockOwnerId,
      occurredAt: new Date('2026-07-27T10:00:00.000Z'),
      note: 'Formula feed',
      feedType: FeedType.FORMULA,
      leftDuration: undefined,
      rightDuration: undefined,
      preparedVolume: 150,
      consumedVolume: 120,
      brand: 'Enfamil A+',
      stage: 'Stage 1',
    });
    expect(result.consumedVolume).toBe(120);
    expect(result.brand).toBe('Enfamil A+');
  });

  it('should throw InvalidFeedVolumeException when consumedVolume > preparedVolume', async () => {
    babyRepo.findById.mockResolvedValue(mockBaby);

    const dto = {
      feedType: FeedType.FORMULA,
      occurredAt: '2026-07-27T10:00:00.000Z',
      preparedVolume: 100,
      consumedVolume: 150,
    };

    await expect(useCase.execute(mockBabyId, mockOwnerId, dto)).rejects.toThrow(
      InvalidFeedVolumeException,
    );
    expect(feedRepo.create).not.toHaveBeenCalled();
  });

  it('should throw BabyNotFoundException when baby does not exist', async () => {
    babyRepo.findById.mockResolvedValue(null);

    const dto = {
      feedType: FeedType.BREASTFEEDING,
      occurredAt: '2026-07-27T10:00:00.000Z',
    };

    await expect(useCase.execute(mockBabyId, mockOwnerId, dto)).rejects.toThrow(
      BabyNotFoundException,
    );
    expect(feedRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenBabyAccessException when caller is not baby owner', async () => {
    babyRepo.findById.mockResolvedValue({
      ...mockBaby,
      ownerId: 'other-user',
    });

    const dto = {
      feedType: FeedType.BREASTFEEDING,
      occurredAt: '2026-07-27T10:00:00.000Z',
    };

    await expect(useCase.execute(mockBabyId, mockOwnerId, dto)).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
    expect(feedRepo.create).not.toHaveBeenCalled();
  });
});
