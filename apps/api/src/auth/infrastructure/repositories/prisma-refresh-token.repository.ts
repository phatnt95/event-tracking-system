import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken as RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(dbToken: RefreshToken): RefreshTokenEntity {
    return new RefreshTokenEntity(
      dbToken.id,
      dbToken.token,
      dbToken.userId,
      dbToken.expiresAt,
      dbToken.isRevoked,
      dbToken.createdAt,
      dbToken.updatedAt,
    );
  }

  async save(token: string, userId: string, expiresAt: Date): Promise<RefreshTokenEntity> {
    const saved = await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
    return this.mapToEntity(saved);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    return tokenRecord ? this.mapToEntity(tokenRecord) : null;
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }
}
