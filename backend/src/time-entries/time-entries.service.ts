import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
