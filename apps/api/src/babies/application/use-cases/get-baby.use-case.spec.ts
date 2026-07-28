/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { GetBabyUseCase } from './get-baby.use-case';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import {
  BabyNotFoundException,
  ForbiddenBabyAccessException,
} from '../../domain/errors/baby.errors';
import { Gender } from '@baby-tracker/shared-types';

describe('GetBabyUseCase', () => {
  let useCase: GetBabyUseCase;
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
      providers: [GetBabyUseCase, { provide: IBabyRepository, useValue: repoMock }],
    }).compile();

    useCase = module.get<GetBabyUseCase>(GetBabyUseCase);
  });

  it('should throw BabyNotFoundException if baby is not found', async () => {
    repoMock.findById.mockResolvedValue(null);

    await expect(useCase.execute('baby-id', 'owner-id')).rejects.toThrow(BabyNotFoundException);
  });

  it('should throw ForbiddenBabyAccessException if baby does not belong to the user', async () => {
    const mockBaby = {
      id: 'baby-id',
      ownerId: 'different-owner',
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      birthday: new Date(),
      birthWeight: 3.4,
      birthHeight: 50.5,
      note: 'healthy',
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repoMock.findById.mockResolvedValue(mockBaby);

    await expect(useCase.execute('baby-id', 'owner-id')).rejects.toThrow(
      ForbiddenBabyAccessException,
    );
  });

  it('should return baby details if user owns it', async () => {
    const mockBaby = {
      id: 'baby-id',
      ownerId: 'owner-id',
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      birthday: new Date('2026-04-15T08:30:00.000Z'),
      birthWeight: 3.4,
      birthHeight: 50.5,
      note: 'healthy',
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repoMock.findById.mockResolvedValue(mockBaby);

    const response = await useCase.execute('baby-id', 'owner-id');

    expect(repoMock.findById).toHaveBeenCalledWith('baby-id');
    expect(response.id).toBe('baby-id');
    expect(response.name).toBe('Liam');
  });
});
