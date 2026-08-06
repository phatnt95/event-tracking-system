import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { CompleteVaccinationDto } from '../dtos/complete-vaccination.dto';
import { VaccinationRecordResponse, VaccinationStatus } from '@baby-tracker/shared-types';

@Injectable()
export class CompleteVaccinationUseCase {
  constructor(
    @Inject(IVaccinationRepository)
    private readonly vaccinationRepo: IVaccinationRepository,
  ) {}

  async execute(
    id: string,
    dto: CompleteVaccinationDto,
    userId: string,
  ): Promise<VaccinationRecordResponse> {
    const record = await this.vaccinationRepo.findById(id);
    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }
    if (record.baby.ownerId !== userId) {
      throw new ForbiddenException('Access forbidden');
    }

    if (record.status === VaccinationStatus.COMPLETED) {
      throw new BadRequestException('Vaccination is already completed');
    }

    const actualDate = new Date(dto.actualVaccinationDate);
    const babyBirthDate = new Date(record.baby.birthday);
    if (actualDate < babyBirthDate) {
      throw new BadRequestException('Vaccination date cannot be before baby birth date');
    }

    const updated = await this.vaccinationRepo.completeVaccination(
      id,
      {
        actualVaccinationDate: actualDate,
        hospitalClinic: dto.hospitalClinic,
        doctor: dto.doctor,
        manufacturer: dto.manufacturer,
        batchNumber: dto.batchNumber,
        notes: dto.notes,
      },
      userId,
    );

    return {
      id: updated.id,
      babyId: updated.babyId,
      vaccineName: updated.vaccineName,
      dose: updated.dose,
      recommendedAgeMonths: updated.recommendedAgeMonths,
      recommendedDate: updated.recommendedDate.toISOString(),
      isOptional: updated.isOptional,
      status: VaccinationStatus.COMPLETED,
      actualVaccinationDate: updated.actualVaccinationDate
        ? updated.actualVaccinationDate.toISOString()
        : null,
      hospitalClinic: updated.hospitalClinic,
      doctor: updated.doctor,
      batchNumber: updated.batchNumber,
      manufacturer: updated.manufacturer,
      notes: updated.notes,
      eventId: updated.eventId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
