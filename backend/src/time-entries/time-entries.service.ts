import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { Pause } from 'src/pauses/entities/pause.entity';
import { User } from 'src/user/entities/user.entity';
import { Vacation } from 'src/vacations/entities/vacation.entity';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry) // Injectez le repository des entrées de temps
    private readonly timeEntriesRepository: Repository<TimeEntry>,
    @InjectRepository(UserSession) // Injectez correctement la table des sessions
    private readonly sessionRepository: Repository<UserSession>,
    @InjectRepository(Declaration) // Injection correcte
    private readonly declarationRepository: Repository<Declaration>,
    @InjectRepository(Pause) // Injection correcte
    private readonly pauseRepository: Repository<Pause>,
    @InjectRepository(User) // Injection correcte
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vacation) // Injection correcte
    private readonly vacationsRepository: Repository<Vacation>,
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
      relations: ['user'],
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

  async getTimeEntriesForMonth(userId: string, year: number, week: number) {
    // Définition des dates pour le mois
    const startDate = new Date(year, week - 1, 1); // Premier jour de la semaine
    const endDate = new Date(year, week, 0, 23, 59, 59); // Dernier jour de la semaine
    console.log('StartDate:', startDate, 'EndDate:', endDate);

    // Récupérer les pointages
    const timeEntries = await this.timeEntriesRepository.find({
      where: {
        user: { id: userId },
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
      },
      relations: ['pauses'],
    });

    // Récupérer les vacances chevauchant l'intervalle
    const vacations = await this.vacationsRepository.find({
      where: [
        {
          user: { id: userId },
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      ],
    });

    // Retourner les deux ensembles de données
    return {
      timeEntries,
      vacations,
    };
  }

  async declarePeriod(
    userId: string,
    startDate: string,
    endDate: string,
    workedHours: number,
    pauseHours: number,
    contractualHours: number,
    extraHours: number,
  ) {
    // Création de la déclaration
    const declaration = this.declarationRepository.create({
      user: { id: userId },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workedHours,
      pauseHours,
      contractualHours,
      extraHours,
    });

    // Sauvegarde dans la base de données
    const savedDeclaration = await this.declarationRepository.save(declaration);

    // TypeScript doit reconnaître `savedDeclaration` comme une `Declaration`
    return {
      message: 'Période déclarée avec succès',
      declarationId: (savedDeclaration as Declaration).id,
    };
  }

  async getTimeEntriesBetweenDates(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimeEntry[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Inclure toute la journée du endDate

    return this.timeEntriesRepository.find({
      where: {
        user: { id: userId },
        startTime: Between(start, end),
      },
    });
  }

  async getPausesBetweenDates(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Pause[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.pauseRepository.find({
      where: {
        timeEntry: {
          user: { id: userId },
          startTime: Between(start, end),
        },
      },
    });
  }

  calculateTotalHours(entries: { startTime: Date; endTime: Date }[]): number {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return total + (end - start) / (1000 * 60 * 60); // Convertir en heures
    }, 0);
  }

  async calculateHours(userId: string, startDate: string, endDate: string) {
    const timeEntries = await this.getTimeEntriesBetweenDates(
      userId,
      startDate,
      endDate,
    );
    const pauses = await this.getPausesBetweenDates(userId, startDate, endDate);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.weeklyHoursGoal || !user.workingDays) {
      throw new NotFoundException('User configuration is incomplete.');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const entriesOnWorkingDays = timeEntries.filter((entry) => {
      const dayOfWeek = new Date(entry.startTime).getDay();
      return user.workingDays.map(Number).includes(dayOfWeek);
    });

    const entriesOnNonWorkingDays = timeEntries.filter((entry) => {
      const dayOfWeek = new Date(entry.startTime).getDay();
      return !user.workingDays.map(Number).includes(dayOfWeek);
    });

    // Calcul des heures travaillées
    const workedHoursOnWorkingDays = this.calculateTotalHours(
      entriesOnWorkingDays.map((entry) => ({
        startTime: entry.startTime,
        endTime: entry.endTime || new Date(),
      })),
    );

    const workedHoursOnNonWorkingDays = this.calculateTotalHours(
      entriesOnNonWorkingDays.map((entry) => ({
        startTime: entry.startTime,
        endTime: entry.endTime || new Date(),
      })),
    );

    // Calcul des pauses
    const totalPauseHours = this.calculateTotalHours(
      pauses.map((pause) => ({
        startTime: pause.pauseStart,
        endTime: pause.pauseEnd || new Date(),
      })),
    );

    // Calcul des jours ouvrés sans congés
    const workingDaysCount =
      await this.countCustomWorkingDaysExcludingVacations(
        start,
        end,
        user.workingDays.map(Number),
        userId,
      );

    const hoursPerDay = user.weeklyHoursGoal / user.workingDays.length;
    const contractualHours = workingDaysCount * hoursPerDay;

    // Calcul des heures supplémentaires
    const extraHours =
      workedHoursOnWorkingDays +
      workedHoursOnNonWorkingDays -
      totalPauseHours -
      contractualHours;

    return {
      workedHours:
        workedHoursOnWorkingDays +
        workedHoursOnNonWorkingDays -
        totalPauseHours,
      pauseHours: totalPauseHours,
      contractualHours,
      extraHours,
    };
  }

  private getMonthRange(year: number, month: number) {
    console.log('*******************');
    console.log('month', month);

    // Vérifier si le mois est déjà 0-indexé
    if (month < 0 || month > 11) {
      throw new Error(
        'Invalid month value. Month should be 0-11 (January = 0).',
      );
    }

    // Début du mois (toujours 0-indexé dans `Date`)
    const startOfMonth = new Date(year, month, 1);
    const startDay = startOfMonth.getDay() || 7; // Dimanche = 0 devient 7
    const startDate = new Date(startOfMonth);
    startDate.setDate(startOfMonth.getDate() - (startDay - 1)); // Reculer au lundi précédent

    // Fin du mois (toujours 0-indexé dans `Date`)
    const endOfMonth = new Date(year, month + 1, 0); // Dernier jour du mois courant
    const endDay = endOfMonth.getDay();
    const endDate = new Date(endOfMonth);
    endDate.setDate(endOfMonth.getDate() + (7 - endDay)); // Avancer au dimanche suivant

    console.log('Calculated Month Range:', { startDate, endDate });

    return { startDate, endDate };
  }

  async calculateMonthlyHoursWithRates(
    userId: string,
    year: number,
    month: number,
  ) {
    const { startDate, endDate } = this.getMonthRange(year, month);
    console.log('Entrées récupérées pour la période :', { startDate, endDate });

    // const baseResult = await this.calculateHours(
    //   userId,
    //   startDate.toISOString(),
    //   endDate.toISOString(),
    // );

    const timeEntries = await this.getTimeEntriesBetweenDates(
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
    );

    // Regrouper par semaines
    const weeks = this.groupEntriesByWeek(timeEntries);

    // Calculer les heures supplémentaires et majorations pour chaque semaine
    const weeklyHours = weeks.map(({ weekStart, weekEnd, entries }) => {
      const workedHours = this.calculateTotalHours(
        entries.map((entry) => ({
          startTime: entry.startTime,
          endTime: entry.endTime || new Date(),
        })),
      );

      const extraHours = Math.max(0, workedHours - 35);

      let extra25Hours = 0;
      let extra50Hours = 0;

      if (extraHours > 0) {
        // Les 8 premières heures au-delà de 35h sont majorées à 25%
        if (extraHours <= 8) {
          extra25Hours = extraHours;
        } else {
          extra25Hours = 8;
          extra50Hours = extraHours - 8; // Le reste est majoré à 50%
        }
      }

      return {
        weekStart,
        weekEnd,
        workedHours,
        extra25Hours,
        extra50Hours,
      };
    });

    return {
      totalExtra25Hours: weeklyHours.reduce(
        (sum, week) => sum + week.extra25Hours,
        0,
      ),
      totalExtra50Hours: weeklyHours.reduce(
        (sum, week) => sum + week.extra50Hours,
        0,
      ),
      weeklyDetails: weeklyHours,
    };
  }

  private groupEntriesByWeek(entries: TimeEntry[]) {
    const grouped = new Map<string, TimeEntry[]>();

    entries.forEach((entry) => {
      const weekKey = this.getWeekKey(entry.startTime);
      if (!grouped.has(weekKey)) {
        grouped.set(weekKey, []);
      }
      grouped.get(weekKey).push(entry);
    });

    return Array.from(grouped.entries()).map(([weekKey, entries]) => {
      const [year, week] = weekKey.split('-');
      const weekStart = this.getStartOfWeek(
        parseInt(year, 10),
        parseInt(week, 10),
      );
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return { weekStart, weekEnd, entries };
    });
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.ceil(
      ((date.getTime() - this.getStartOfYear(date).getTime()) /
        (1000 * 60 * 60 * 24) +
        1) /
        7,
    );
    return `${year}-${week}`;
  }

  private getStartOfYear(date: Date): Date {
    const start = new Date(date.getFullYear(), 0, 1);
    start.setDate(
      start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1),
    );
    return start;
  }

  private getStartOfWeek(year: number, week: number): Date {
    const start = new Date(year, 0, 1);
    start.setDate(start.getDate() + (week - 1) * 7);
    start.setDate(
      start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1),
    );
    return start;
  }

  private async countCustomWorkingDaysExcludingVacations(
    startDate: Date,
    endDate: Date,
    workingDays: number[],
    userId: string,
  ): Promise<number> {
    let count = 0;
    const current = new Date(startDate);

    // Récupérer les congés de l'utilisateur
    const vacations = await this.getVacationsBetweenDates(
      userId,
      startDate,
      endDate,
    );

    while (current <= endDate) {
      const dayOfWeek = current.getDay();

      // Vérifier si le jour est un jour ouvré
      if (workingDays.includes(dayOfWeek)) {
        // Vérifier si le jour ne chevauche aucun congé
        const isVacation = vacations.some(
          (vacation) =>
            current >= new Date(vacation.startDate) &&
            current <= new Date(vacation.endDate),
        );

        if (!isVacation) {
          count++;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  private async getVacationsBetweenDates(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Vacation[]> {
    return this.vacationsRepository.find({
      where: [
        {
          user: { id: userId },
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      ],
    });
  }

  private countCustomWorkingDays(
    startDate: Date,
    endDate: Date,
    workingDays: number[],
  ): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (workingDays.some((day) => day.toString() === dayOfWeek.toString())) {
        count++;
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}
