import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BabiesModule } from '../babies/babies.module';
import { GetDashboardUseCase } from './application/use-cases/get-dashboard.use-case';
import { IDashboardRepository } from './domain/repositories/dashboard.repository.interface';
import { PrismaDashboardRepository } from './infrastructure/repositories/prisma-dashboard.repository';
import { DashboardController } from './presentation/controllers/dashboard.controller';

@Module({
  imports: [AuthModule, BabiesModule],
  controllers: [DashboardController],
  providers: [
    GetDashboardUseCase,
    {
      provide: IDashboardRepository,
      useClass: PrismaDashboardRepository,
    },
  ],
})
export class DashboardModule {}
