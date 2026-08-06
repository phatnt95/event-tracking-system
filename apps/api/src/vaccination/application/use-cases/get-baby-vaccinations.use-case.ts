import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import {
  BabyVaccinationsResponse,
  VaccinationRecordResponse,
  VaccinationStatus,
} from '@baby-tracker/shared-types';

@Injectable()
export class GetBabyVaccinationsUseCase {
  constructor(
    @Inject(IVaccinationRepository)
    private readonly vaccinationRepo: IVaccinationRepository,
    @Inject(IBabyRepository)
    private readonly babyRepo: IBabyRepository,
  ) {}

  async execute(babyId: string, ownerId: string): Promise<BabyVaccinationsResponse> {
    const baby = await this.babyRepo.findById(babyId);
    if (!baby) {
      throw new NotFoundException('Baby not found');
    }
    if (baby.ownerId !== ownerId) {
      throw new ForbiddenException('Access forbidden to this baby profile');
    }

    const rawRecords = await this.vaccinationRepo.findByBabyId(babyId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const processedRecords: VaccinationRecordResponse[] = rawRecords.map((r) => {
      const recDate = new Date(r.recommendedDate);
      const startOfRecDate = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());

      let computedStatus = r.status as VaccinationStatus;
      let overdueDays: number | undefined;
      let remainingDays: number | undefined;

      if (r.status !== VaccinationStatus.COMPLETED && r.status !== VaccinationStatus.SKIPPED) {
        if (r.isOptional) {
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
        id: r.id,
        babyId: r.babyId,
        vaccineName: r.vaccineName,
        dose: r.dose,
        recommendedAgeMonths: r.recommendedAgeMonths,
        recommendedDate: r.recommendedDate.toISOString(),
        isOptional: r.isOptional,
        status: computedStatus,
        actualVaccinationDate: r.actualVaccinationDate
          ? r.actualVaccinationDate.toISOString()
          : null,
        hospitalClinic: r.hospitalClinic,
        doctor: r.doctor,
        batchNumber: r.batchNumber,
        manufacturer: r.manufacturer,
        notes: r.notes,
        eventId: r.eventId,
        overdueDays,
        remainingDays,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    const upcoming = processedRecords.filter((r) => r.status === VaccinationStatus.UPCOMING);
    const completed = processedRecords.filter((r) => r.status === VaccinationStatus.COMPLETED);
    const overdue = processedRecords.filter((r) => r.status === VaccinationStatus.OVERDUE);

    return {
      upcoming,
      completed,
      overdue,
      timeline: processedRecords,
    };
  }
}
