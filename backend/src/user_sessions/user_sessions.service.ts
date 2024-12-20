import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user_session.entity';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  async findOne(id: string): Promise<UserSession> {
    console.log('test');

    return this.userSessionRepository.findOne({ where: { id } });
  }

  async deleteSessionByUserId(userId: string): Promise<void> {
    const result = await this.userSessionRepository.delete({
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException('Session not found for the given user');
    }
  }

  async saveSession(session: Partial<UserSession>) {
    return this.userSessionRepository.save(session);
  }
}
