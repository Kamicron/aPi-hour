import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vacation } from './entities/vacation.entity';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';

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
      user: { id: userId }, // Associer l'utilisateur ici
    });

    return await this.vacationRepository.save(vacation);
  }

  async findUserVacations(userId: string): Promise<Vacation[]> {
    return await this.vacationRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findAll(): Promise<Vacation[]> {
    return await this.vacationRepository.find();
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
