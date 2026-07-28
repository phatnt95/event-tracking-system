import { Module } from '@nestjs/common';
import { EventsController } from './presentation/controllers/events.controller';
import { CreateEventUseCase } from './application/use-cases/create-event.use-case';
import { GetEventUseCase } from './application/use-cases/get-event.use-case';
import { ListEventsUseCase } from './application/use-cases/list-events.use-case';
import { UpdateEventUseCase } from './application/use-cases/update-event.use-case';
import { DeleteEventUseCase } from './application/use-cases/delete-event.use-case';
import { IEventRepository } from './domain/repositories/event.repository.interface';
import { PrismaEventRepository } from './infrastructure/repositories/prisma-event.repository';
import { BabiesModule } from '../babies/babies.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, BabiesModule],
  controllers: [EventsController],
  providers: [
    CreateEventUseCase,
    GetEventUseCase,
    ListEventsUseCase,
    UpdateEventUseCase,
    DeleteEventUseCase,
    {
      provide: IEventRepository,
      useClass: PrismaEventRepository,
    },
  ],
})
export class EventsModule {}
