import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Récupérer tous les utilisateurs (sans ceux supprimés)
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // Créer un nouvel utilisateur
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  // Mettre à jour un utilisateur
  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findOne(id); // Vérifie si l'utilisateur existe
    Object.assign(user, userData);
    return this.userRepository.save(user);
  }

  // Suppression logique (soft delete)
  async softDelete(id: string): Promise<void> {
    const result = await this.userRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  // Restaurer un utilisateur supprimé
  async restore(id: string): Promise<void> {
    const result = await this.userRepository.restore(id);
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
