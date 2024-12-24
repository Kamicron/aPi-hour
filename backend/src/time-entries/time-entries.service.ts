import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry) // Injectez le repository des entrées de temps
    private readonly timeEntriesRepository: Repository<TimeEntry>,
    @InjectRepository(UserSession) // Injectez correctement la table des sessions
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  // Créer une entrée de pointage
  async create(userId: string, data: Partial<TimeEntry>) {
    const timeEntry = this.timeEntriesRepository.create({
      ...data,
      user: { id: userId },
    });
    return this.timeEntriesRepository.save(timeEntry);
  }

  // Modifier une entrée de pointage
  async update(
    id: string,
    userId: string,
    userRole: string,
    data: Partial<TimeEntry>,
  ) {
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id },
      relations: ['user', 'pauses'], // Assurez-vous que la relation 'user' est incluse
    });

    if (!timeEntry) throw new NotFoundException('Time entry not found');
    if (timeEntry.user.id !== userId && userRole !== 'admin') {
      throw new UnauthorizedException(
        'You do not have permission to modify this time entry.',
      );
    }

    // Validation des pauses
    if (data.startTime || data.endTime) {
      for (const pause of timeEntry.pauses) {
        const pauseStart = new Date(pause.pauseStart).getTime();
        const pauseEnd = pause.pauseEnd
          ? new Date(pause.pauseEnd).getTime()
          : null;

        if (
          (data.startTime && new Date(data.startTime).getTime() > pauseStart) ||
          (data.endTime &&
            pauseEnd &&
            new Date(data.endTime).getTime() < pauseEnd)
        ) {
          throw new UnauthorizedException(
            'Session times must include all pauses.',
          );
        }
      }
    }

    Object.assign(timeEntry, data);
    return this.timeEntriesRepository.save(timeEntry);
  }

  // Soft delete une entrée de pointage
  async softDelete(id: string, userId: string, userRole: string) {
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id },
    });

    if (!timeEntry) throw new NotFoundException('Time entry not found');
    if (timeEntry.user.id !== userId && userRole !== 'admin') {
      throw new UnauthorizedException(
        'You do not have permission to delete this time entry.',
      );
    }

    return this.timeEntriesRepository.softDelete(id);
  }

  // Restaurer une entrée soft deleted
  async restore(id: string) {
    const result = await this.timeEntriesRepository.restore(id);
    if (!result.affected) {
      throw new NotFoundException('Time entry not found or already active.');
    }
  }

  // Récupérer toutes les entrées
  async findAll(userId: string, userRole: string) {
    if (userRole === 'admin') {
      return this.timeEntriesRepository.find({ withDeleted: true });
    }
    return this.timeEntriesRepository.find({ where: { user: { id: userId } } });
  }

  // Récupérer une entrée spécifique
  async findOne(id: string, userId: string, userRole: string) {
    console.log('=============');
    console.log('id', id);
    console.log('userId', userId);
    console.log('userRole', userRole);
    console.log('=============');

    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id },
      relations: ['user', 'pauses'], // Inclure les pauses et l'utilisateur
      withDeleted: userRole === 'admin',
    });

    console.log('timeEntry', timeEntry);

    if (!timeEntry) throw new NotFoundException('Time entry not found');
    if (timeEntry.user.id !== userId && userRole !== 'admin') {
      throw new UnauthorizedException(
        'You do not have permission to access this time entry.',
      );
    }

    return timeEntry;
  }

  async findByDate(date: string, userId: string, userRole: string) {
    const query = this.timeEntriesRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.pauses', 'pauses') // Inclure les pauses
      .where('DATE(timeEntry.startTime) = :date', { date });

    if (userRole !== 'admin') {
      query.andWhere('timeEntry.userId = :userId', { userId });
    }

    const sessions = await query.getMany();

    // Calculer les totaux
    return this.calculateWorkDetails(sessions);
  }

  private calculateWorkDetails(sessions: any[]) {
    let totalWorkTime = 0;
    let totalPauseTime = 0;

    const details = sessions.map((session) => {
      const startTime = new Date(session.startTime);
      const endTime = session.endTime ? new Date(session.endTime) : new Date();

      // Temps de travail brut
      const workTime = (endTime.getTime() - startTime.getTime()) / 1000;

      // Temps de pause total
      const pauseTime = session.pauses.reduce((sum: number, pause: any) => {
        const pauseStart = new Date(pause.pauseStart);
        const pauseEnd = pause.pauseEnd ? new Date(pause.pauseEnd) : new Date();
        return sum + (pauseEnd.getTime() - pauseStart.getTime()) / 1000;
      }, 0);

      totalWorkTime += workTime - pauseTime;
      totalPauseTime += pauseTime;

      return {
        sessionId: session.id,
        startTime,
        endTime,
        workTime: workTime - pauseTime,
        pauseTime,
      };
    });

    return {
      totalWorkTime,
      totalPauseTime,
      details,
    };
  }

  async start(userId: string) {
    // Créer une nouvelle entrée dans `time_entries`
    const timeEntry = this.timeEntriesRepository.create({
      user: { id: userId },
      startTime: new Date(),
    });
    const savedEntry = await this.timeEntriesRepository.save(timeEntry);

    // Mettre à jour ou créer une nouvelle session pour l'utilisateur

    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    console.log('session', session);

    if (session) {
      session.status = 'started';
      session.timeEntry = savedEntry;
      session.pause = null;
    } else {
      await this.sessionRepository.save({
        user: { id: userId },
        timeEntry: savedEntry,
        status: 'started',
      });
    }

    return savedEntry;
  }

  // Terminer une session
  async end(id: string, userId: string) {
    // Récupérer l'entrée de temps associée
    const timeEntry = await this.getTimeEntry(id, userId);

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    // Mettre à jour l'heure de fin
    timeEntry.endTime = new Date();
    const updatedTimeEntry = await this.timeEntriesRepository.save(timeEntry);

    // Mettre à jour le statut dans user_sessions
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    console.log('session', session);

    if (session) {
      await this.sessionRepository.remove(session);
    }

    return updatedTimeEntry;
  }

  // Méthode privée pour valider l'accès à une session
  async getTimeEntry(id: string, userId: string) {
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!timeEntry) throw new NotFoundException('Time entry not found');
    return timeEntry;
  }

  async getTimeEntriesForMonth(userId: string, year: number, Week: number) {
    const startDate = new Date(year, Week - 1, 1); // Premier jour du mois
    const endDate = new Date(year, Week, 0, 23, 59, 59); // Dernier jour du mois
    console.log('StartDate:', startDate, 'EndDate:', endDate);

    return this.timeEntriesRepository.find({
      where: {
        user: { id: userId },
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
      },

      relations: ['pauses'],
    });
  }
}
