import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IVaccinationRepository,
  VaccinationRecordWithBaby,
  CompleteVaccinationData,
  UpdateVaccinationData,
} from '../../domain/repositories/vaccination.repository.interface';
import { DEFAULT_VACCINATION_SCHEDULE } from '../../domain/constants/vaccination-schedule.constant';
import { EventType, VaccinationStatus } from '@prisma/client';

@Injectable()
export class PrismaVaccinationRepository implements IVaccinationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBabyId(babyId: string): Promise<VaccinationRecordWithBaby[]> {
    let records = await this.prisma.vaccinationRecord.findMany({
      where: { babyId },
      include: { baby: true },
      orderBy: { recommendedDate: 'asc' },
    });

    if (records.length === 0) {
      const baby = await this.prisma.baby.findUnique({
        where: { id: babyId },
      });
      if (baby) {
        records = await this.seedScheduleForBaby(babyId, baby.birthday);
      }
    }

    return records;
  }

  async seedScheduleForBaby(babyId: string, birthday: Date): Promise<VaccinationRecordWithBaby[]> {
    const dataToCreate = DEFAULT_VACCINATION_SCHEDULE.map((item) => {
      const recDate = new Date(birthday);
      const monthsToAdd = Math.floor(item.recommendedAgeMonths);
      const daysToAdd = (item.recommendedAgeMonths - monthsToAdd) * 30;
      recDate.setMonth(recDate.getMonth() + monthsToAdd);
      recDate.setDate(recDate.getDate() + Math.round(daysToAdd));

      return {
        babyId,
        vaccineName: item.vaccineName,
        dose: item.dose,
        recommendedAgeMonths: item.recommendedAgeMonths,
        recommendedDate: recDate,
        isOptional: item.isOptional ?? false,
        status: item.isOptional ? VaccinationStatus.OPTIONAL : VaccinationStatus.PENDING,
      };
    });

    await this.prisma.vaccinationRecord.createMany({
      data: dataToCreate,
    });

    return this.prisma.vaccinationRecord.findMany({
      where: { babyId },
      include: { baby: true },
      orderBy: { recommendedDate: 'asc' },
    });
  }

  async findById(id: string): Promise<VaccinationRecordWithBaby | null> {
    return this.prisma.vaccinationRecord.findUnique({
      where: { id },
      include: { baby: true },
    });
  }

  async completeVaccination(
    id: string,
    data: CompleteVaccinationData,
    userId: string,
  ): Promise<VaccinationRecordWithBaby> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.vaccinationRecord.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error('Vaccination record not found');
      }

      let eventId = existing.eventId;
      if (!eventId) {
        const createdEvent = await tx.event.create({
          data: {
            babyId: existing.babyId,
            type: EventType.VACCINE,
            occurredAt: data.actualVaccinationDate,
            note: data.notes || `Completed ${existing.vaccineName} (${existing.dose})`,
            createdBy: userId,
          },
        });
        eventId = createdEvent.id;
      } else {
        await tx.event.update({
          where: { id: eventId },
          data: {
            occurredAt: data.actualVaccinationDate,
            note: data.notes || `Completed ${existing.vaccineName} (${existing.dose})`,
          },
        });
      }

      return tx.vaccinationRecord.update({
        where: { id },
        data: {
          status: VaccinationStatus.COMPLETED,
          actualVaccinationDate: data.actualVaccinationDate,
          hospitalClinic: data.hospitalClinic,
          doctor: data.doctor,
          manufacturer: data.manufacturer,
          batchNumber: data.batchNumber,
          notes: data.notes,
          eventId,
        },
        include: { baby: true },
      });
    });
  }

  async updateVaccination(
    id: string,
    data: UpdateVaccinationData,
  ): Promise<VaccinationRecordWithBaby> {
    return this.prisma.vaccinationRecord.update({
      where: { id },
      data: {
        ...(data.actualVaccinationDate !== undefined && {
          actualVaccinationDate: data.actualVaccinationDate,
        }),
        ...(data.hospitalClinic !== undefined && { hospitalClinic: data.hospitalClinic }),
        ...(data.doctor !== undefined && { doctor: data.doctor }),
        ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
        ...(data.batchNumber !== undefined && { batchNumber: data.batchNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isOptional !== undefined && { isOptional: data.isOptional }),
      },
      include: { baby: true },
    });
  }
}
