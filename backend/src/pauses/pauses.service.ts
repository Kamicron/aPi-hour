import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pause } from './entities/pause.entity';
import { TimeEntriesService } from '../time-entries/time-entries.service';

@Injectable()
export class PausesService {
  constructor(
    @InjectRepository(Pause)
    private readonly pauseRepository: Repository<Pause>,
    private readonly timeEntriesService: TimeEntriesService, // Inject TimeEntriesService
  ) {}

  async addPause(timeEntryId: string, userId: string) {
    const timeEntry = await this.timeEntriesService.getTimeEntry(
      timeEntryId,
      userId,
    );

    const pause = this.pauseRepository.create({
      timeEntry,
      pauseStart: new Date(),
    });

    return this.pauseRepository.save(pause);
  }

  async resumePause(timeEntryId: string, userId: string) {
    const timeEntry = await this.timeEntriesService.getTimeEntry(
      timeEntryId,
      userId,
    );

    // Correction de la condition
    const lastPause = await this.pauseRepository.findOne({
      where: { timeEntry: { id: timeEntry.id }, pauseEnd: null }, // Vérifie explicitement NULL
      order: { pauseStart: 'DESC' },
    });

    if (!lastPause) {
      throw new NotFoundException('No active pause to resume.');
    }

    lastPause.pauseEnd = new Date();
    return this.pauseRepository.save(lastPause);
  }
}
