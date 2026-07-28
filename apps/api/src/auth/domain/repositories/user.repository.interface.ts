import { User } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: { email: string; passwordHash: string; displayName: string }): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
