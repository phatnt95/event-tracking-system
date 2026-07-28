import { Module } from '@nestjs/common';
import { DiaperController } from './presentation/controllers/diaper.controller';
import { PrismaDiaperEventRepository } from './infrastructure/repositories/prisma-diaper-event.repository';
import { CreateDiaperUseCase } from './application/use-cases/create-diaper.use-case';
import { GetDiaperUseCase } from './application/use-cases/get-diaper.use-case';
import { ListDiapersUseCase } from './application/use-cases/list-diapers.use-case';
import { UpdateDiaperUseCase } from './application/use-cases/update-diaper.use-case';
import { DeleteDiaperUseCase } from './application/use-cases/delete-diaper.use-case';
import { AuthModule } from 'src/auth/auth.module';
import { BabiesModule } from '../babies/babies.module';
import { IDiaperEventRepository } from './domain/repositories/diaper-event.repository.interface';

@Module({
  imports: [AuthModule, BabiesModule],
  controllers: [DiaperController],
  providers: [
    {
      provide: IDiaperEventRepository,
      useClass: PrismaDiaperEventRepository,
    },
    CreateDiaperUseCase,
    GetDiaperUseCase,
    ListDiapersUseCase,
    UpdateDiaperUseCase,
    DeleteDiaperUseCase,
  ],
})
export class DiaperModule {}
