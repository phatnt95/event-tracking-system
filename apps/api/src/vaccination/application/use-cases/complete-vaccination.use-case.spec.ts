import { Test, TestingModule } from '@nestjs/testing';
import { CompleteVaccinationUseCase } from './complete-vaccination.use-case';
import { IVaccinationRepository } from '../../domain/repositories/vaccination.repository.interface';
import { VaccinationStatus } from '@baby-tracker/shared-types';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CompleteVaccinationUseCase', () => {
  let useCase: CompleteVaccinationUseCase;
  let vaccinationRepoMock: jest.Mocked<IVaccinationRepository>;

  beforeEach(async () => {
    vaccinationRepoMock = {
      findByBabyId: jest.fn(),
      findById: jest.fn(),
      seedScheduleForBaby: jest.fn(),
      completeVaccination: jest.fn(),
      updateVaccination: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompleteVaccinationUseCase,
        { provide: IVaccinationRepository, useValue: vaccinationRepoMock },
      ],
    }).compile();

    useCase = module.get<CompleteVaccinationUseCase>(CompleteVaccinationUseCase);
  });

  it('should throw BadRequestException if vaccination date is before baby birth date', async () => {
    vaccinationRepoMock.findById.mockResolvedValue({
      id: 'vac-1',
      babyId: 'baby-1',
      vaccineName: 'Hepatitis B',
      dose: 'Dose 0',
      status: VaccinationStatus.PENDING as any,
      baby: {
        id: 'baby-1',
        ownerId: 'owner-1',
        birthday: new Date('2026-05-01'),
      },
    } as any);

    await expect(
      useCase.execute(
        'vac-1',
        {
          actualVaccinationDate: '2026-04-01T00:00:00.000Z',
        },
        'owner-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if already completed', async () => {
    vaccinationRepoMock.findById.mockResolvedValue({
      id: 'vac-1',
      babyId: 'baby-1',
      status: VaccinationStatus.COMPLETED as any,
      baby: {
        id: 'baby-1',
        ownerId: 'owner-1',
        birthday: new Date('2026-01-01'),
      },
    } as any);

    await expect(
      useCase.execute(
        'vac-1',
        {
          actualVaccinationDate: '2026-02-01T00:00:00.000Z',
        },
        'owner-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should complete vaccination successfully', async () => {
    vaccinationRepoMock.findById.mockResolvedValue({
      id: 'vac-1',
      babyId: 'baby-1',
      vaccineName: 'Hepatitis B',
      dose: 'Dose 0',
      recommendedAgeMonths: 0,
      recommendedDate: new Date('2026-01-01'),
      isOptional: false,
      status: VaccinationStatus.PENDING as any,
      baby: {
        id: 'baby-1',
        ownerId: 'owner-1',
        birthday: new Date('2026-01-01'),
      },
    } as any);

    vaccinationRepoMock.completeVaccination.mockResolvedValue({
      id: 'vac-1',
      babyId: 'baby-1',
      vaccineName: 'Hepatitis B',
      dose: 'Dose 0',
      recommendedAgeMonths: 0,
      recommendedDate: new Date('2026-01-01'),
      isOptional: false,
      status: VaccinationStatus.COMPLETED as any,
      actualVaccinationDate: new Date('2026-01-02'),
      hospitalClinic: 'Children Hospital',
      doctor: 'Dr. Smith',
      manufacturer: 'Pharma',
      batchNumber: 'B123',
      notes: 'Good',
      eventId: 'evt-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      baby: { id: 'baby-1', ownerId: 'owner-1', birthday: new Date('2026-01-01') } as any,
    });

    const res = await useCase.execute(
      'vac-1',
      {
        actualVaccinationDate: '2026-01-02T00:00:00.000Z',
        hospitalClinic: 'Children Hospital',
        doctor: 'Dr. Smith',
        manufacturer: 'Pharma',
        batchNumber: 'B123',
        notes: 'Good',
      },
      'owner-1',
    );

    expect(res.status).toBe(VaccinationStatus.COMPLETED);
    expect(res.hospitalClinic).toBe('Children Hospital');
  });
});
