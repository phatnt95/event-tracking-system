import { Inject, Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { InvalidTokenException, TokenExpiredException } from '../../domain/errors/auth.errors';
import { TokenResponse } from '@baby-tracker/shared-types';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    @Inject(ITokenService)
    private readonly tokenService: ITokenService,
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(refreshToken: string): Promise<TokenResponse> {
    let payload: { userId: string; email: string };
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidTokenException();
    }

    const tokenEntity = await this.refreshTokenRepo.findByToken(refreshToken);
    if (!tokenEntity || tokenEntity.isRevoked) {
      throw new InvalidTokenException('Refresh token is invalid or has been revoked');
    }

    if (tokenEntity.expiresAt.getTime() < Date.now()) {
      throw new TokenExpiredException();
    }

    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new InvalidTokenException('User account no longer exists');
    }

    // Revoke old token (Rotation)
    await this.refreshTokenRepo.revoke(refreshToken);

    // Generate new pair
    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Save new refresh token
    await this.refreshTokenRepo.save(tokens.refreshToken, user.id, tokens.expiresAt);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
