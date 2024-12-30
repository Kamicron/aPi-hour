import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntry } from './entities/time-entry.entity';
import { UserSession } from '../user_sessions/entities/user_session.entity';
import { Declaration } from '../declarations/entities/declaration.entity';
import { Pause } from '../pauses/entities/pause.entity';
import { User } from '../user/entities/user.entity';
import { VacationsModule } from '../vacations/vacations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeEntry,
      UserSession,
      Declaration,
      Pause,
      User,
    ]),
    VacationsModule, // Ajout correct du module
  ],
  controllers: [TimeEntriesController],
  providers: [TimeEntriesService],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}
