/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { RefreshUseCase } from './refresh.use-case';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { InvalidTokenException, TokenExpiredException } from '../../domain/errors/auth.errors';

describe('RefreshUseCase', () => {
  let useCase: RefreshUseCase;
  let refreshRepoMock: jest.Mocked<IRefreshTokenRepository>;
  let tokenServiceMock: jest.Mocked<ITokenService>;
  let userRepoMock: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    refreshRepoMock = {
      save: jest.fn(),
      findByToken: jest.fn(),
      revoke: jest.fn(),
    } as any;

    tokenServiceMock = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as any;

    userRepoMock = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshUseCase,
        { provide: IRefreshTokenRepository, useValue: refreshRepoMock },
        { provide: ITokenService, useValue: tokenServiceMock },
        { provide: IUserRepository, useValue: userRepoMock },
      ],
    }).compile();

    useCase = module.get<RefreshUseCase>(RefreshUseCase);
  });

  it('should throw UnauthorizedException if verifyRefreshToken fails', async () => {
    tokenServiceMock.verifyRefreshToken.mockRejectedValue(new Error('JWT error'));

    await expect(useCase.execute('invalid-token')).rejects.toThrow(InvalidTokenException);
  });

  it('should throw UnauthorizedException if token record does not exist or is revoked', async () => {
    tokenServiceMock.verifyRefreshToken.mockResolvedValue({
      userId: 'user-id',
      email: 'test@example.com',
    });
    refreshRepoMock.findByToken.mockResolvedValue(null);

    await expect(useCase.execute('valid-sig-but-not-in-db')).rejects.toThrow(InvalidTokenException);
  });

  it('should throw UnauthorizedException if refresh token is expired', async () => {
    tokenServiceMock.verifyRefreshToken.mockResolvedValue({
      userId: 'user-id',
      email: 'test@example.com',
    });
    refreshRepoMock.findByToken.mockResolvedValue({
      id: 'token-id',
      token: 'expired-token',
      userId: 'user-id',
      expiresAt: new Date(Date.now() - 10000), // in the past
      isRevoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(useCase.execute('expired-token')).rejects.toThrow(TokenExpiredException);
  });

  it('should rotate tokens if validations pass', async () => {
    tokenServiceMock.verifyRefreshToken.mockResolvedValue({
      userId: 'user-id',
      email: 'test@example.com',
    });
    refreshRepoMock.findByToken.mockResolvedValue({
      id: 'token-id',
      token: 'active-token',
      userId: 'user-id',
      expiresAt: new Date(Date.now() + 100000), // in future
      isRevoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    userRepoMock.findById.mockResolvedValue({
      id: 'user-id',
      email: 'test@example.com',
      passwordHash: 'hash',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockNewTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: new Date(Date.now() + 200000),
    };
    tokenServiceMock.generateTokens.mockResolvedValue(mockNewTokens);

    const response = await useCase.execute('active-token');

    expect(refreshRepoMock.revoke).toHaveBeenCalledWith('active-token');
    expect(refreshRepoMock.save).toHaveBeenCalledWith(
      'new-refresh-token',
      'user-id',
      mockNewTokens.expiresAt,
    );
    expect(response.accessToken).toBe('new-access-token');
    expect(response.refreshToken).toBe('new-refresh-token');
  });
});
