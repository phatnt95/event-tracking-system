import { Test, TestingModule } from '@nestjs/testing';
import { GetBabyVaccinationsUseCase } from './get-baby-vaccinations.use-case';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { IBabyRepository } from '../../../babies/domain/repositories/baby.repository.interface';
import { VaccinationStatus } from '@baby-tracker/shared-types';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('GetBabyVaccinationsUseCase', () => {
  let useCase: GetBabyVaccinationsUseCase;
  let vaccinationRepoMock: jest.Mocked<IVaccinationRepository>;
  let babyRepoMock: jest.Mocked<IBabyRepository>;

  beforeEach(async () => {
    vaccinationRepoMock = {
      findByBabyId: jest.fn(),
      findById: jest.fn(),
      seedScheduleForBaby: jest.fn(),
      completeVaccination: jest.fn(),
      updateVaccination: jest.fn(),
    } as any;

    babyRepoMock = {
      findById: jest.fn(),
      findByOwner: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBabyVaccinationsUseCase,
        { provide: IVaccinationRepository, useValue: vaccinationRepoMock },
        { provide: IBabyRepository, useValue: babyRepoMock },
      ],
    }).compile();

    useCase = module.get<GetBabyVaccinationsUseCase>(GetBabyVaccinationsUseCase);
  });

  it('should throw NotFoundException if baby does not exist', async () => {
    babyRepoMock.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-baby-id', 'owner-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not owner of baby', async () => {
    babyRepoMock.findById.mockResolvedValue({
      id: 'baby-1',
      ownerId: 'owner-2',
      name: 'Baby 1',
      birthday: new Date('2026-01-01'),
    } as any);

    await expect(useCase.execute('baby-1', 'owner-1')).rejects.toThrow(ForbiddenException);
  });

  it('should return categorized vaccinations for a baby', async () => {
    babyRepoMock.findById.mockResolvedValue({
      id: 'baby-1',
      ownerId: 'owner-1',
      name: 'Baby 1',
      birthday: new Date('2026-01-01'),
    } as any);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);

    vaccinationRepoMock.findByBabyId.mockResolvedValue([
      {
        id: 'vac-1',
        babyId: 'baby-1',
        vaccineName: 'Hepatitis B',
        dose: 'Dose 0',
        recommendedAgeMonths: 0,
        recommendedDate: pastDate,
        isOptional: false,
        status: VaccinationStatus.PENDING as any,
        actualVaccinationDate: null,
        hospitalClinic: null,
        doctor: null,
        batchNumber: null,
        manufacturer: null,
        notes: null,
        eventId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        baby: { ownerId: 'owner-1' } as any,
      },
      {
        id: 'vac-2',
        babyId: 'baby-1',
        vaccineName: 'BCG',
        dose: 'Dose 1',
        recommendedAgeMonths: 1,
        recommendedDate: futureDate,
        isOptional: false,
        status: VaccinationStatus.PENDING as any,
        actualVaccinationDate: null,
        hospitalClinic: null,
        doctor: null,
        batchNumber: null,
        manufacturer: null,
        notes: null,
        eventId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        baby: { ownerId: 'owner-1' } as any,
      },
    ]);

    const result = await useCase.execute('baby-1', 'owner-1');

    expect(result.overdue.length).toBe(1);
    expect(result.overdue[0].id).toBe('vac-1');
    expect(result.upcoming.length).toBe(1);
    expect(result.upcoming[0].id).toBe('vac-2');
    expect(result.timeline.length).toBe(2);
  });
});
