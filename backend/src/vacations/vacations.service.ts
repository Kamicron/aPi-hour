import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacation } from './entities/vacation.entity';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { GetVacationsDto } from './dto/get-vacations.dto';

@Injectable()
export class VacationsService {
  constructor(
    @InjectRepository(Vacation)
    private vacationRepository: Repository<Vacation>,
  ) {}

  async createVacation(
    userId: string,
    dto: CreateVacationDto,
  ): Promise<Vacation> {
    if (!userId) {
      throw new Error('User ID is required to create a vacation');
    }

    const vacation = this.vacationRepository.create({
      ...dto,
      user: { id: userId },
    });

    return await this.vacationRepository.save(vacation);
  }

  async findUserVacations(userId: string, query: GetVacationsDto) {
    const queryBuilder = this.vacationRepository
      .createQueryBuilder('vacation')
      .where('vacation.user.id = :userId', { userId })
      .leftJoinAndSelect('vacation.user', 'user');

    // Appliquer le filtre de statut si fourni
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      if (statuses.length > 0) {
        queryBuilder.andWhere('vacation.status IN (:...status)', { status: statuses });
      }
    }

    // Appliquer le tri
    const sortBy = query.sortBy || 'startDate';
    const sortOrder = query.sortOrder || 'DESC';
    queryBuilder.orderBy(`vacation.${sortBy}`, sortOrder);

    // Calculer le total avant pagination
    const total = await queryBuilder.getCount();

    // Appliquer la pagination
    const page = Math.max(1, parseInt(query.page?.toString() || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(query.limit?.toString() || '10')));
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const items = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  async findAll(query: GetVacationsDto) {
    const queryBuilder = this.vacationRepository
      .createQueryBuilder('vacation')
      .leftJoinAndSelect('vacation.user', 'user');

    // Appliquer le filtre de statut si fourni
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      if (statuses.length > 0) {
        queryBuilder.andWhere('vacation.status IN (:...status)', { status: statuses });
      }
    }

    // Appliquer le tri
    const sortBy = query.sortBy || 'startDate';
    const sortOrder = query.sortOrder || 'DESC';
    queryBuilder.orderBy(`vacation.${sortBy}`, sortOrder);

    // Calculer le total avant pagination
    const total = await queryBuilder.getCount();

    // Appliquer la pagination
    const page = Math.max(1, parseInt(query.page?.toString() || '1'));
    const limit = Math.max(1, Math.min(50, parseInt(query.limit?.toString() || '10')));
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const items = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  async updateVacation(id: string, dto: UpdateVacationDto): Promise<Vacation> {
    const vacation = await this.vacationRepository.findOneBy({ id });
    if (!vacation) {
      throw new NotFoundException('Vacances non trouvées');
    }
    Object.assign(vacation, dto);
    return await this.vacationRepository.save(vacation);
  }

  async deleteVacation(id: string): Promise<void> {
    const result = await this.vacationRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Vacances non trouvées');
    }
  }
}
