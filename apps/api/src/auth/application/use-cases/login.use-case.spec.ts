/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { InvalidCredentialsException } from '../../domain/errors/auth.errors';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
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
        LoginUseCase,
        { provide: IUserRepository, useValue: userRepoMock },
        { provide: IPasswordHasher, useValue: hasherMock },
        { provide: ITokenService, useValue: tokenServiceMock },
        { provide: IRefreshTokenRepository, useValue: refreshRepoMock },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should throw UnauthorizedException if email is not found', async () => {
    userRepoMock.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'password',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should throw UnauthorizedException if password compare returns false', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'hash',
      displayName: 'Test',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    hasherMock.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should return token details if authentication is successful', async () => {
    userRepoMock.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'hash',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    hasherMock.compare.mockResolvedValue(true);

    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 10000),
    };
    tokenServiceMock.generateTokens.mockResolvedValue(mockTokens);

    const response = await useCase.execute({
      email: 'test@example.com',
      password: 'password',
    });

    expect(hasherMock.compare).toHaveBeenCalledWith('password', 'hash');
    expect(refreshRepoMock.save).toHaveBeenCalledWith(
      'refresh-token',
      'user-id',
      mockTokens.expiresAt,
    );
    expect(response.tokens.accessToken).toBe('access-token');
    expect(response.user.email).toBe('test@example.com');
  });
});
