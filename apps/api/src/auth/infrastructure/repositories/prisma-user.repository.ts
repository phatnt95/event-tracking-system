import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User as UserEntity } from '../../domain/entities/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(dbUser: User): UserEntity {
    return new UserEntity(
      dbUser.id,
      dbUser.email,
      dbUser.password, // maps to passwordHash
      dbUser.displayName,
      dbUser.createdAt,
      dbUser.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async create(user: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.passwordHash,
        displayName: user.displayName,
      },
    });
    return this.mapToEntity(created);
  }
}
