import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PausesService } from './pauses.service';
import { PausesController } from './pauses.controller';
import { Pause } from './entities/pause.entity';
import { TimeEntriesModule } from '../time-entries/time-entries.module';
import { UserSessionsModule } from '../user_sessions/user_sessions.module';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';
import { TimeEntry } from 'src/time-entries/entities/time-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pause, TimeEntry, UserSession]), // Ajout des entités manquantes
    TimeEntriesModule,
    UserSessionsModule,
  ],
  providers: [PausesService],
  controllers: [PausesController],
})
export class PausesModule {}

