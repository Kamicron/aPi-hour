import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntriesRepository: Repository<TimeEntry>,
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
    });

    if (!timeEntry) throw new NotFoundException('Time entry not found');
    if (timeEntry.user.id !== userId && userRole !== 'admin') {
      throw new UnauthorizedException(
        'You do not have permission to modify this time entry.',
      );
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
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id },
      withDeleted: userRole === 'admin',
    });

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
    const timeEntry = this.timeEntriesRepository.create({
      user: { id: userId },
      startTime: new Date(),
    });
    return this.timeEntriesRepository.save(timeEntry);
  }

  // Terminer une session
  async end(id: string, userId: string) {
    const timeEntry = await this.getTimeEntry(id, userId);
    timeEntry.endTime = new Date();
    return this.timeEntriesRepository.save(timeEntry);
  }

  // Méthode privée pour valider l'accès à une session
  async getTimeEntry(id: string, userId: string) {
    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!timeEntry) throw new NotFoundException('Time entry not found');
    return timeEntry;
  }

  async getTimeEntriesForMonth(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1); // Premier jour du mois
    const endDate = new Date(year, month, 0, 23, 59, 59); // Dernier jour du mois
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
