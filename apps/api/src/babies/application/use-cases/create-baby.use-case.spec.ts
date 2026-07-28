/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateBabyUseCase } from './create-baby.use-case';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { Gender } from '@baby-tracker/shared-types';

describe('CreateBabyUseCase', () => {
  let useCase: CreateBabyUseCase;
  let repoMock: jest.Mocked<IBabyRepository>;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByOwner: jest.fn(),
      archive: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateBabyUseCase, { provide: IBabyRepository, useValue: repoMock }],
    }).compile();

    useCase = module.get<CreateBabyUseCase>(CreateBabyUseCase);
  });

  it('should create baby profile successfully', async () => {
    const mockBaby = {
      id: 'baby-id',
      ownerId: 'owner-id',
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      birthday: new Date('2026-04-15T08:30:00.000Z'),
      birthWeight: 3.4,
      birthHeight: 50.5,
      note: 'healthy birth',
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repoMock.create.mockResolvedValue(mockBaby);

    const response = await useCase.execute('owner-id', {
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      birthday: '2026-04-15T08:30:00.000Z',
      birthWeight: 3.4,
      birthHeight: 50.5,
      note: 'healthy birth',
    });

    expect(repoMock.create).toHaveBeenCalledWith({
      ownerId: 'owner-id',
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      birthday: new Date('2026-04-15T08:30:00.000Z'),
      birthWeight: 3.4,
      birthHeight: 50.5,
      note: 'healthy birth',
    });
    expect(response.id).toBe('baby-id');
    expect(response.name).toBe('Liam');
  });
});
