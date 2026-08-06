import { VaccinationRecord, Baby, VaccinationStatus } from '@prisma/client';

export type VaccinationRecordWithBaby = VaccinationRecord & {
  baby: Baby;
};

export interface CompleteVaccinationData {
  actualVaccinationDate: Date;
  hospitalClinic?: string | null;
  doctor?: string | null;
  manufacturer?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
}

export interface UpdateVaccinationData {
  actualVaccinationDate?: Date | null;
  hospitalClinic?: string | null;
  doctor?: string | null;
  manufacturer?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  status?: VaccinationStatus;
  isOptional?: boolean;
}

export interface IVaccinationRepository {
  findByBabyId(babyId: string): Promise<VaccinationRecordWithBaby[]>;
  findById(id: string): Promise<VaccinationRecordWithBaby | null>;
  seedScheduleForBaby(babyId: string, birthday: Date): Promise<VaccinationRecordWithBaby[]>;
  completeVaccination(
    id: string,
    data: CompleteVaccinationData,
    userId: string,
  ): Promise<VaccinationRecordWithBaby>;
  updateVaccination(id: string, data: UpdateVaccinationData): Promise<VaccinationRecordWithBaby>;
}

export const IVaccinationRepository = Symbol('IVaccinationRepository');
