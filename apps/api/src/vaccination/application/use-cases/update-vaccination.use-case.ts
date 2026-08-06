import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { UpdateVaccinationDto } from '../dtos/update-vaccination.dto';
import { VaccinationRecordResponse, VaccinationStatus } from '@baby-tracker/shared-types';

@Injectable()
export class UpdateVaccinationUseCase {
  constructor(
    @Inject(IVaccinationRepository)
    private readonly vaccinationRepo: IVaccinationRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateVaccinationDto,
    userId: string,
  ): Promise<VaccinationRecordResponse> {
    const record = await this.vaccinationRepo.findById(id);
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }
    if (record.baby.ownerId !== userId) {
      throw new ForbiddenException('Access forbidden');
    }

    if (dto.actualVaccinationDate) {
      const actualDate = new Date(dto.actualVaccinationDate);
      const babyBirthDate = new Date(record.baby.birthday);
      if (actualDate < babyBirthDate) {
        throw new BadRequestException('Vaccination date cannot be before baby birth date');
      }
    }

    const updated = await this.vaccinationRepo.updateVaccination(id, {
      actualVaccinationDate: dto.actualVaccinationDate
        ? new Date(dto.actualVaccinationDate)
        : undefined,
      hospitalClinic: dto.hospitalClinic,
      doctor: dto.doctor,
      manufacturer: dto.manufacturer,
      batchNumber: dto.batchNumber,
      notes: dto.notes,
      status: dto.status as unknown as VaccinationStatus,
      isOptional: dto.isOptional,
    });

    const recDate = new Date(updated.recommendedDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfRecDate = new Date(recDate.getFullYear(), recDate.getMonth(), recDate.getDate());

    let computedStatus = updated.status as VaccinationStatus;
    let overdueDays: number | undefined;
    let remainingDays: number | undefined;

    if (
      updated.status !== VaccinationStatus.COMPLETED &&
      updated.status !== VaccinationStatus.SKIPPED
    ) {
      if (updated.isOptional) {
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
      id: updated.id,
      babyId: updated.babyId,
      vaccineName: updated.vaccineName,
      dose: updated.dose,
      recommendedAgeMonths: updated.recommendedAgeMonths,
      recommendedDate: updated.recommendedDate.toISOString(),
      isOptional: updated.isOptional,
      status: computedStatus,
      actualVaccinationDate: updated.actualVaccinationDate
        ? updated.actualVaccinationDate.toISOString()
        : null,
      hospitalClinic: updated.hospitalClinic,
      doctor: updated.doctor,
      batchNumber: updated.batchNumber,
      manufacturer: updated.manufacturer,
      notes: updated.notes,
      eventId: updated.eventId,
      overdueDays,
      remainingDays,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
