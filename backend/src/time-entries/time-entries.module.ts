import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesController } from './time-entries.controller';
import { TimeEntry } from './entities/time-entry.entity';
import { UserSessionsModule } from '../user_sessions/user_sessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeEntry]),
    UserSessionsModule, // Importer UserSessionsModule
  ],
  providers: [TimeEntriesService],
  controllers: [TimeEntriesController],
  exports: [TimeEntriesService],
})
export class TimeEntriesModule {}
