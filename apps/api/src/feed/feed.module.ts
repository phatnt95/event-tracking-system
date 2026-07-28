import { Module } from '@nestjs/common';
import { FeedController } from './presentation/controllers/feed.controller';
import { CreateFeedUseCase } from './application/use-cases/create-feed.use-case';
import { GetFeedUseCase } from './application/use-cases/get-feed.use-case';
import { ListFeedsUseCase } from './application/use-cases/list-feeds.use-case';
import { UpdateFeedUseCase } from './application/use-cases/update-feed.use-case';
import { DeleteFeedUseCase } from './application/use-cases/delete-feed.use-case';
import { IFeedEventRepository } from './domain/repositories/feed-event.repository.interface';
import { PrismaFeedEventRepository } from './infrastructure/repositories/prisma-feed-event.repository';
import { BabiesModule } from '../babies/babies.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, BabiesModule],
  controllers: [FeedController],
  providers: [
    CreateFeedUseCase,
    GetFeedUseCase,
    ListFeedsUseCase,
    UpdateFeedUseCase,
    DeleteFeedUseCase,
    {
      provide: IFeedEventRepository,
      useClass: PrismaFeedEventRepository,
    },
  ],
  exports: [IFeedEventRepository],
})
export class FeedModule {}
