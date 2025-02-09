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

    const timeEntry = await this.timeEntriesRepository.findOne({
      where: { id },
      relations: ['user', 'pauses'], // Inclure les pauses et l'utilisateur
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

    const endTime = new Date();
    
    // Vérifier si la session dépasse minuit
    if (this.isSessionCrossingMidnight(timeEntry.startTime, endTime)) {
      // Créer une date à 23:59:30 du jour de début
      const midnightEnd = new Date(timeEntry.startTime);
      midnightEnd.setHours(23, 59, 30, 0);
      
      // Terminer la session actuelle à 23:59:30
      timeEntry.endTime = midnightEnd;
      await this.timeEntriesRepository.save(timeEntry);

      // Créer une nouvelle session à partir de 00:00:30
      const nextDayStart = new Date(timeEntry.startTime);
      nextDayStart.setDate(nextDayStart.getDate() + 1);
      nextDayStart.setHours(0, 0, 30, 0);

      // Créer la nouvelle session
      const newTimeEntry = await this.create(userId, {
        startTime: nextDayStart,
        endTime: endTime,
      });

      // Mettre à jour la session utilisateur
      const session = await this.sessionRepository.findOne({
        where: { user: { id: userId } },
      });

      if (session) {
        await this.sessionRepository.remove(session);
      }

      return newTimeEntry;
    }

    // Comportement normal si la session ne dépasse pas minuit
    timeEntry.endTime = endTime;
    const updatedTimeEntry = await this.timeEntriesRepository.save(timeEntry);

    // Mettre à jour le statut dans user_sessions
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
    });

    if (session) {
      await this.sessionRepository.remove(session);
    }

    return updatedTimeEntry;
  }

  // Vérifier si une session dépasse minuit
  private isSessionCrossingMidnight(startTime: Date, endTime: Date): boolean {
    const startDay = startTime.getDate();
    const endDay = endTime.getDate();
    return startDay !== endDay;
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
    // Vérifier si le mois est déjà 0-indexé
    if (month < 0 || month > 11) {
      throw new Error(
        'Invalid month value. Month should be 0-11 (January = 0).',
      );
    }

    // Premier jour du mois
    const firstDayOfMonth = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Trouver le lundi précédant le premier jour du mois si le mois ne commence pas un lundi
    const startDate = new Date(firstDayOfMonth);
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = dimanche, 1 = lundi, etc.
    if (firstDayWeekday !== 1) { // Si ce n'est pas un lundi
      // Reculer jusqu'au lundi précédent
      startDate.setDate(firstDayOfMonth.getDate() - ((firstDayWeekday === 0 ? 7 : firstDayWeekday) - 1));
    }

    // Trouver le dernier dimanche complet du mois
    const endDate = new Date(lastDayOfMonth);
    const lastDayWeekday = lastDayOfMonth.getDay();
    if (lastDayWeekday !== 0) { // Si ce n'est pas un dimanche
      // Reculer jusqu'au dimanche précédent
      endDate.setDate(lastDayOfMonth.getDate() - lastDayWeekday);
    }

    // S'assurer que endDate est à 23:59:59
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  async calculateMonthlyHoursWithRates(
    userId: string,
    year: number,
    month: number,
  ) {
    const { startDate, endDate } = this.getMonthRange(year, month);

    // Récupérer toutes les entrées pour la période
    const timeEntries = await this.getTimeEntriesBetweenDates(
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
    );

    // Regrouper les entrées par semaine
    const weeklyEntries = this.groupEntriesByWeek(timeEntries);

    // Calculer les heures pour chaque semaine
    const weeklyHours = await Promise.all(
      weeklyEntries.map(async ({ weekStart, weekEnd, entries }) => {
        // Calculer les heures travaillées pour la semaine
        const weeklyResult = await this.calculateHours(
          userId,
          weekStart.toISOString(),
          weekEnd.toISOString(),
        );

        // Les heures réellement travaillées (sans les pauses)
        const workedHours = weeklyResult.workedHours;

        // Calcul des heures supplémentaires
        const extraHours = Math.max(0, workedHours - 35);

        // Application des taux de majoration
        let extra25Hours = 0;
        let extra50Hours = 0;

        if (extraHours > 0) {
          // Les 8 premières heures sont à 25%
          extra25Hours = Math.min(8, extraHours);
          // Les heures suivantes sont à 50%
          if (extraHours > 8) {
            extra50Hours = extraHours - 8;
          }
        }

        return {
          weekStart,
          weekEnd,
          normalHours: Math.min(35, workedHours),
          workedHours,
          extra25Hours,
          extra50Hours,
        };
      }),
    );

    // Calculer les totaux pour le mois
    const monthlyTotals = weeklyHours.reduce(
      (totals, week) => ({
        totalWorkedHours: totals.totalWorkedHours + week.workedHours,
        totalNormalHours: totals.totalNormalHours + week.normalHours,
        totalExtra25Hours: totals.totalExtra25Hours + week.extra25Hours,
        totalExtra50Hours: totals.totalExtra50Hours + week.extra50Hours,
      }),
      {
        totalWorkedHours: 0,
        totalNormalHours: 0,
        totalExtra25Hours: 0,
        totalExtra50Hours: 0,
      },
    );

    return {
      ...monthlyTotals,
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

  async getExtraHoursHeatmap(userId: string) {
    
    try {
      // Calculer la période d'un an
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0); // Dernier jour du mois actuel
      endDate.setHours(23, 59, 59, 999);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11); // 12 mois en arrière
      startDate.setDate(1); // Premier jour du mois
      startDate.setHours(0, 0, 0, 0);

      
      // Récupérer l'utilisateur et ses paramètres
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user || !user.weeklyHoursGoal || !user.workingDays) {
        return {};
      }

      // Récupérer toutes les entrées de temps pour la période
      const timeEntries = await this.getTimeEntriesBetweenDates(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (!timeEntries.length) {
        return {};
      }

      // Récupérer toutes les pauses pour la période
      const allPauses = await this.getPausesBetweenDates(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Récupérer tous les congés pour la période
      const allVacations = await this.getVacationsBetweenDates(
        userId,
        startDate,
        endDate
      );

      // Préparer un tableau pour stocker les résultats
      const dailyHours: Record<string, number> = {};
      
      // Pour chaque jour de la période
      let currentDate = new Date(startDate);
      const hoursPerDay = user.weeklyHoursGoal / user.workingDays.length;

      // Convertir les jours de travail en format JavaScript
      // Dans notre DB: 0 = Lundi, 1 = Mardi, ..., 6 = Dimanche
      // En JS: 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
      const workingDaysJS = user.workingDays.map(day => {
        const dbDay = Number(day);
        // Convertir de notre format (0-6, lundi-dimanche) vers le format JS (0-6, dimanche-samedi)
        return dbDay === 6 ? 0 : dbDay + 1;
      });

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Filtrer les entrées pour ce jour
        const dayEntries = timeEntries.filter(entry => {
          const entryDate = new Date(entry.startTime);
          return entryDate.toISOString().split('T')[0] === dateStr;
        });

        // Vérifier si c'est un jour de congé
        const isVacationDay = allVacations.some(vacation => {
          const vacationStart = new Date(vacation.startDate);
          const vacationEnd = new Date(vacation.endDate);
          return currentDate >= vacationStart && currentDate <= vacationEnd;
        });

        if (!isVacationDay) {
          // Calculer les heures travaillées
          const workedHours = this.calculateTotalHours(
            dayEntries.map(entry => ({
              startTime: entry.startTime,
              endTime: entry.endTime || new Date(),
            }))
          );

          // Calculer les pauses
          const pauseHours = this.calculateTotalHours(
            allPauses
              .filter(pause => {
                const pauseDate = new Date(pause.pauseStart);
                return pauseDate.toISOString().split('T')[0] === dateStr;
              })
              .map(pause => ({
                startTime: pause.pauseStart,
                endTime: pause.pauseEnd || new Date(),
              }))
          );

          // Vérifier si c'est un jour ouvré
          const dayOfWeek = currentDate.getDay(); // 0-6 (dimanche-samedi)
          const isWorkingDay = workingDaysJS.includes(dayOfWeek);

          // Calculer les heures supplémentaires
          const contractualHours = isWorkingDay ? hoursPerDay : 0;
          const extraHours = workedHours - pauseHours - contractualHours;

          // Si c'est un jour ouvré et qu'il y a des entrées
          if (isWorkingDay && dayEntries.length > 0) {
            dailyHours[dateStr] = extraHours; // Peut être négatif pour les jours incomplets
          } 
          // Pour les jours non ouvrés, ne compter que les heures positives
          else if (!isWorkingDay && extraHours > 0) {
            dailyHours[dateStr] = extraHours;
          }
        }

        // Passer au jour suivant
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dailyHours;
    } catch (error) {
      console.error('Error in getExtraHoursHeatmap:', error);
      throw error;
    }
  }
}
