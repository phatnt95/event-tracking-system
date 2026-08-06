import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { VaccinationRecordResponse, VaccinationStatus } from '@baby-tracker/shared-types';

@Injectable()
export class GetVaccinationDetailUseCase {
  constructor(
    @Inject(IVaccinationRepository)
    private readonly vaccinationRepo: IVaccinationRepository,
  ) {}

  async execute(id: string, ownerId: string): Promise<VaccinationRecordResponse> {
    const record = await this.vaccinationRepo.findById(id);
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }
    if (record.baby.ownerId !== ownerId) {
      throw new ForbiddenException('Access forbidden');
    }

    const recDate = new Date(record.recommendedDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfRecDate = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());

    let computedStatus = record.status as VaccinationStatus;
    let overdueDays: number | undefined;
    let remainingDays: number | undefined;

    if (
      record.status !== VaccinationStatus.COMPLETED &&
      record.status !== VaccinationStatus.SKIPPED
    ) {
      if (record.isOptional) {
        computedStatus = VaccinationStatus.OPTIONAL;
      } else if (startOfRecDate < startOfToday) {
        computedStatus = VaccinationStatus.OVERDUE;
        overdueDays = Math.floor(
          (startOfToday.getTime() - startOfRecDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      } else if (startOfRecDate.getTime() === startOfToday.getTime()) {
        computedStatus = VaccinationStatus.UPCOMING;
        remainingDays = 0;
      } else {
        remainingDays = Math.floor(
          (startOfRecDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (remainingDays <= 30) {
          computedStatus = VaccinationStatus.UPCOMING;
        } else {
          computedStatus = VaccinationStatus.PENDING;
        }
      }
    }

    return {
      id: record.id,
      babyId: record.babyId,
      vaccineName: record.vaccineName,
      dose: record.dose,
      recommendedAgeMonths: record.recommendedAgeMonths,
      recommendedDate: record.recommendedDate.toISOString(),
      isOptional: record.isOptional,
      status: computedStatus,
      actualVaccinationDate: record.actualVaccinationDate
        ? record.actualVaccinationDate.toISOString()
        : null,
      hospitalClinic: record.hospitalClinic,
      doctor: record.doctor,
      batchNumber: record.batchNumber,
      manufacturer: record.manufacturer,
      notes: record.notes,
      eventId: record.eventId,
      overdueDays,
      remainingDays,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
