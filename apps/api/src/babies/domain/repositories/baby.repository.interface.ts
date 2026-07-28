import { Baby } from '../entities/baby.entity';
import { Gender } from '@baby-tracker/shared-types';

export interface IBabyRepository {
  create(baby: {
    ownerId: string;
    name: string;
    nickname?: string | null;
    gender: Gender;
    birthday: Date;
    birthWeight?: number | null;
    birthHeight?: number | null;
    note?: string | null;
  }): Promise<Baby>;

  update(
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
  ): Promise<Baby>;

  findById(id: string): Promise<Baby | null>;

  findByOwner(ownerId: string): Promise<Baby[]>;

  archive(id: string): Promise<void>;
}

export const IBabyRepository = Symbol('IBabyRepository');
