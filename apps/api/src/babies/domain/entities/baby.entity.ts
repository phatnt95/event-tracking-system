import { Gender } from '@baby-tracker/shared-types';

export class Baby {
  constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly nickname: string | null,
    public readonly gender: Gender,
    public readonly birthday: Date,
    public readonly birthWeight: number | null,
    public readonly birthHeight: number | null,
    public readonly note: string | null,
    public readonly archived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
