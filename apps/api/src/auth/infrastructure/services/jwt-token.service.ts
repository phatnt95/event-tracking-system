import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
    const accessExpiresIn = (this.configService.get<string>('JWT_EXPIRES_IN') ||
      '15m') as JwtSignOptions['expiresIn'];
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: accessExpiresIn,
    });

    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    const refreshExpiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      '7d') as JwtSignOptions['expiresIn'];

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshExpiresIn,
    });

    // Extract exact expiration date from signed token payload
    const decoded = this.jwtService.decode(refreshToken) as { exp?: number } | null;
    const expiresAt = new Date(
      (decoded?.exp || Math.floor(Date.now() / 1000) + 7 * 24 * 3600) * 1000,
    );

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
