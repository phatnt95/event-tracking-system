export interface ITokenService {
  generateTokens(payload: { userId: string; email: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date; // when the refresh token expires
  }>;
  verifyAccessToken(token: string): Promise<{ userId: string; email: string }>;
  verifyRefreshToken(token: string): Promise<{ userId: string; email: string }>;
}

export const ITokenService = Symbol('ITokenService');
