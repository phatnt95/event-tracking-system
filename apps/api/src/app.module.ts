import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BabiesModule } from './babies/babies.module';
import { EventsModule } from './events/events.module';
import { FeedModule } from './feed/feed.module';
import { DiaperModule } from './diaper/diaper.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    BabiesModule,
    EventsModule,
    FeedModule,
    DiaperModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
