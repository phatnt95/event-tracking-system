/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenService } from '../../application/interfaces/token-service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: { userId: string; email: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
  }> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') as any) || '15m',
    });

    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshExpiresIn as any,
    });

    // Extract exact expiration date from signed token payload
    const decoded = this.jwtService.decode(refreshToken) as any;
    const expiresAt = new Date((decoded?.exp || Date.now() / 1000 + 7 * 24 * 3600) * 1000);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  async verifyAccessToken(token: string): Promise<{ userId: string; email: string }> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string; email: string }> {
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    return this.jwtService.verifyAsync(token, {
      secret: refreshTokenSecret,
    });
  }
}
