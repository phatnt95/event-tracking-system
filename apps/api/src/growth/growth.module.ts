import { Module } from '@nestjs/common';
import { BabiesModule } from '../babies/babies.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { IGrowthEventRepository } from './domain/repositories/growth-event.repository.interface';
import { PrismaGrowthEventRepository } from './infrastructure/repositories/prisma-growth-event.repository';
import { CreateGrowthUseCase } from './application/use-cases/create-growth.use-case';
import { UpdateGrowthUseCase } from './application/use-cases/update-growth.use-case';
import { DeleteGrowthUseCase } from './application/use-cases/delete-growth.use-case';
import { GetLatestGrowthUseCase } from './application/use-cases/get-latest-growth.use-case';
import { ListGrowthUseCase } from './application/use-cases/list-growth.use-case';
import { GrowthController } from './presentation/controllers/growth.controller';

@Module({
  imports: [PrismaModule, BabiesModule, AuthModule],
  controllers: [GrowthController],
  providers: [
    {
      provide: IGrowthEventRepository,
      useClass: PrismaGrowthEventRepository,
    },
    CreateGrowthUseCase,
    UpdateGrowthUseCase,
    DeleteGrowthUseCase,
    GetLatestGrowthUseCase,
    ListGrowthUseCase,
  ],
  exports: [IGrowthEventRepository],
})
export class GrowthModule {}
