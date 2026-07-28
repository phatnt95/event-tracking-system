import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';
import { ITokenService } from '../interfaces/token-service.interface';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { InvalidCredentialsException } from '../../domain/errors/auth.errors';
import { AuthResponse } from '@baby-tracker/shared-types';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepo: IUserRepository,
    @Inject(IPasswordHasher)
    private readonly hasher: IPasswordHasher,
    @Inject(ITokenService)
    private readonly tokenService: ITokenService,
    @Inject(IRefreshTokenRepository)
    private readonly refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordValid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
    });

    await this.refreshTokenRepo.save(tokens.refreshToken, user.id, tokens.expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
}
