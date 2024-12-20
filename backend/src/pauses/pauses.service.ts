import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pause } from './entities/pause.entity';
import { TimeEntriesService } from '../time-entries/time-entries.service';
import { TimeEntry } from 'src/time-entries/entities/time-entry.entity';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';

@Injectable()
export class PausesService {
  constructor(
    @InjectRepository(Pause)
    private readonly pauseRepository: Repository<Pause>,

    @InjectRepository(TimeEntry) // Injection du dépôt TimeEntry
    private readonly timeEntryRepository: Repository<TimeEntry>,

    @InjectRepository(UserSession) // Injection du dépôt UserSession
    private readonly sessionRepository: Repository<UserSession>,

    private readonly timeEntriesService: TimeEntriesService,
  ) {}

  async addPause(timeEntryId: string, userId: string) {
    // Vérifier si l'entrée de temps existe
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id: timeEntryId, user: { id: userId } },
    });
    if (!timeEntry) throw new NotFoundException('Time entry not found');

    // Créer une nouvelle pause
    const pause = this.pauseRepository.create({
      timeEntry,
      pauseStart: new Date(),
    });
    const savedPause = await this.pauseRepository.save(pause);

    // Mettre à jour le statut dans user_sessions
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (session) {
      session.status = 'paused';
      session.pause = savedPause;
      await this.sessionRepository.save(session);
    }

    return savedPause;
  }

  async resumePause(timeEntryId: string, userId: string) {
    console.log('timeEntryId', timeEntryId);
    console.log('userId', userId);

    // Vérifier si l'entrée de temps existe
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id: timeEntryId, user: { id: userId } },
    });
    if (!timeEntry) throw new NotFoundException('Time entry not found');
    console.log('timeEntry', timeEntry);

    // Récupérer la dernière pause sans `pauseEnd`
    const lastPause = await this.pauseRepository.findOne({
      where: { timeEntry: { id: timeEntry.id }, pauseEnd: null }, // Vérifie explicitement NULL
      order: { pauseStart: 'DESC' },
    });

    console.log('lastPause', lastPause);

    if (!lastPause) {
      throw new NotFoundException('No active pause to resume.');
    }

    // Terminer la pause
    lastPause.pauseEnd = new Date();
    const savedPause = await this.pauseRepository.save(lastPause);

    // Mettre à jour le statut dans user_sessions
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (session) {
      session.status = 'started'; // Remettre le statut à "started"
      session.pause = null;
      await this.sessionRepository.save(session);
    }

    return savedPause;
  }
}
