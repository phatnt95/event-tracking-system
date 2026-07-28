/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { EmailAlreadyExistsException } from '../../domain/errors/auth.errors';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepoMock: jest.Mocked<IUserRepository>;
  let hasherMock: jest.Mocked<IPasswordHasher>;
  let tokenServiceMock: jest.Mocked<ITokenService>;
  let refreshRepoMock: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(async () => {
    userRepoMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;

    hasherMock = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as any;

    tokenServiceMock = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as any;

    refreshRepoMock = {
      save: jest.fn(),
      findByToken: jest.fn(),
      revoke: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: IUserRepository, useValue: userRepoMock },
        { provide: IPasswordHasher, useValue: hasherMock },
        { provide: ITokenService, useValue: tokenServiceMock },
        { provide: IRefreshTokenRepository, useValue: refreshRepoMock },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should throw ConflictException if email is already registered', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'hash',
      displayName: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test',
      }),
    ).rejects.toThrow(EmailAlreadyExistsException);
  });

  it('should successfully register and return tokens', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);
    hasherMock.hash.mockResolvedValue('hashed-pass');

    const mockUser = {
      id: 'new-id',
      email: 'test@example.com',
      passwordHash: 'hashed-pass',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userRepoMock.create.mockResolvedValue(mockUser);

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 10000),
    };
    tokenServiceMock.generateTokens.mockResolvedValue(mockTokens);

    const response = await useCase.execute({
      email: 'test@example.com',
      password: 'password',
      displayName: 'Test User',
    });

    expect(userRepoMock.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      passwordHash: 'hashed-pass',
      displayName: 'Test User',
    });
    expect(refreshRepoMock.save).toHaveBeenCalledWith(
      'refresh-token',
      'new-id',
      mockTokens.expiresAt,
    );
    expect(response.tokens.accessToken).toBe('access-token');
    expect(response.user.id).toBe('new-id');
  });
});
