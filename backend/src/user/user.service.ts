import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
    console.log('findOne id', id);

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
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
      select: ['id', 'name', 'email', 'password', 'role'], // Inclure explicitement le champ `password`
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
