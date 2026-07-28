/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { IBabyRepository } from '../../domain/repositories/baby.repository.interface';
import { Baby as BabyEntity } from '../../domain/entities/baby.entity';
import { PrismaService } from '../../../prisma/prisma.service';
import { Gender } from '@baby-tracker/shared-types';

@Injectable()
export class PrismaBabyRepository implements IBabyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(dbBaby: any): BabyEntity {
    return new BabyEntity(
      dbBaby.id,
      dbBaby.ownerId,
      dbBaby.name,
      dbBaby.nickname,
      dbBaby.gender as Gender,
      dbBaby.birthday,
      dbBaby.birthWeight,
      dbBaby.birthHeight,
      dbBaby.note,
      dbBaby.archived,
      dbBaby.createdAt,
      dbBaby.updatedAt,
    );
  }

  async create(baby: {
    ownerId: string;
    name: string;
    nickname?: string | null;
    gender: Gender;
    birthday: Date;
    birthWeight?: number | null;
    birthHeight?: number | null;
    note?: string | null;
  }): Promise<BabyEntity> {
    const dbBaby = await this.prisma.baby.create({
      data: {
        ownerId: baby.ownerId,
        name: baby.name,
        nickname: baby.nickname,
        gender: baby.gender,
        birthday: baby.birthday,
        birthWeight: baby.birthWeight,
        birthHeight: baby.birthHeight,
        note: baby.note,
        archived: false,
      },
    });
    return this.mapToEntity(dbBaby);
  }

  async update(
    id: string,
    baby: {
      name?: string;
      nickname?: string | null;
      gender?: Gender;
      birthday?: Date;
      birthWeight?: number | null;
      birthHeight?: number | null;
      note?: string | null;
    },
  ): Promise<BabyEntity> {
    const dbBaby = await this.prisma.baby.update({
      where: { id },
      data: {
        name: baby.name,
        nickname: baby.nickname,
        gender: baby.gender,
        birthday: baby.birthday,
        birthWeight: baby.birthWeight,
        birthHeight: baby.birthHeight,
        note: baby.note,
      },
    });
    return this.mapToEntity(dbBaby);
  }

  async findById(id: string): Promise<BabyEntity | null> {
    const dbBaby = await this.prisma.baby.findFirst({
      where: { id, archived: false },
    });
    if (!dbBaby) return null;
    return this.mapToEntity(dbBaby);
  }

  async findByOwner(ownerId: string): Promise<BabyEntity[]> {
    const dbBabies = await this.prisma.baby.findMany({
      where: { ownerId, archived: false },
      orderBy: { createdAt: 'desc' },
    });
    return dbBabies.map((b) => this.mapToEntity(b));
  }

  async archive(id: string): Promise<void> {
    await this.prisma.baby.update({
      where: { id },
      data: { archived: true },
    });
  }
}
