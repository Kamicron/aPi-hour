import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PausesController } from './pauses.controller';
import { PausesService } from './pauses.service';
import { Pause } from './entities/pause.entity';
import { TimeEntriesService } from '../time-entries/time-entries.service';
import { TimeEntry } from '../time-entries/entities/time-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pause, TimeEntry])],
  controllers: [PausesController],
  providers: [PausesService, TimeEntriesService],
  exports: [PausesService],
})
export class PausesModule {}
