import { Module } from '@nestjs/common';
import { VaccinationController } from './presentation/controllers/vaccination.controller';
import { GetBabyVaccinationsUseCase } from './application/use-cases/get-baby-vaccinations.use-case';
import { GetVaccinationDetailUseCase } from './application/use-cases/get-vaccination-detail.use-case';
import { CompleteVaccinationUseCase } from './application/use-cases/complete-vaccination.use-case';
import { UpdateVaccinationUseCase } from './application/use-cases/update-vaccination.use-case';
import { IVaccinationRepository } from './domain/repositories/vaccination.repository.interface';
import { PrismaVaccinationRepository } from './infrastructure/repositories/prisma-vaccination.repository';
import { AuthModule } from '../auth/auth.module';
import { BabiesModule } from '../babies/babies.module';

@Module({
  imports: [AuthModule, BabiesModule],
  controllers: [VaccinationController],
  providers: [
    GetBabyVaccinationsUseCase,
    GetVaccinationDetailUseCase,
    CompleteVaccinationUseCase,
    UpdateVaccinationUseCase,
    {
      provide: IVaccinationRepository,
      useClass: PrismaVaccinationRepository,
    },
  ],
  exports: [IVaccinationRepository],
})
export class VaccinationModule {}
