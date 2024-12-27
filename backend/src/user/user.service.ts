import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  // Récupérer tous les utilisateurs (sans ceux supprimés)
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Récupérer un utilisateur par ID
  async findOne(userId: string): Promise<any> {
    console.log('findOne: Searching for user with ID:', userId);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sessions'],
    });

    if (!user) throw new NotFoundException('User not found');

    // Récupérer la session active
    const currentSession = await this.sessionRepository.findOne({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
    });

    return {
      ...user,
      currentSession: currentSession || null,
      weeklyHoursGoal: user.weeklyHoursGoal,
      workingDays: user.workingDays,
    };
  }

  // Créer un nouvel utilisateur
  async create(userData: Partial<User>): Promise<User> {
    const salt = await bcrypt.genSalt();
    userData.password = await bcrypt.hash(userData.password, salt);

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // Mettre à jour un utilisateur
  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id); // Vérifie si l'utilisateur existe
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  async updateWorkingDays(userId: string, workingDays: number[]) {
    await this.userRepository.update(userId, { workingDays });
    return { message: 'Jours ouvrés mis à jour avec succès.' };
  }

  // Mettre à jour les paramètres d'heures et de jours ouvrés
  async updateSettings(
    id: string,
    settings: { weeklyHoursGoal?: number },
  ): Promise<User> {
    console.log('id received in updateSettings:', id);

    const user = await this.findOne(id);

    console.log('User found:', user);

    if (settings.weeklyHoursGoal !== undefined) {
      user.weeklyHoursGoal = settings.weeklyHoursGoal;
    }

    return this.userRepository.save(user);
  }

  // Suppression logique (soft delete)
  async softDelete(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Recherche par adresse mail
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'role'],
    });
  }

  // Restaurer un utilisateur supprimé
  async restore(id: string): Promise<void> {
    const result = await this.userRepository.restore(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
