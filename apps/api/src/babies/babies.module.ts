import { Module } from '@nestjs/common';
import { BabiesController } from './presentation/controllers/babies.controller';
import { CreateBabyUseCase } from './application/use-cases/create-baby.use-case';
import { UpdateBabyUseCase } from './application/use-cases/update-baby.use-case';
import { GetBabyUseCase } from './application/use-cases/get-baby.use-case';
import { ListBabiesUseCase } from './application/use-cases/list-babies.use-case';
import { ArchiveBabyUseCase } from './application/use-cases/archive-baby.use-case';
import { IBabyRepository } from './domain/repositories/baby.repository.interface';
import { PrismaBabyRepository } from './infrastructure/repositories/prisma-baby.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BabiesController],
  providers: [
    CreateBabyUseCase,
    UpdateBabyUseCase,
    GetBabyUseCase,
    ListBabiesUseCase,
    ArchiveBabyUseCase,
    {
      provide: IBabyRepository,
      useClass: PrismaBabyRepository,
    },
  ],
  exports: [IBabyRepository],
})
export class BabiesModule {}
