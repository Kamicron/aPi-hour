import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoursDeclaration } from './entities/hours-declaration.entity';

@Injectable()
export class HoursDeclarationService {
  constructor(
    @InjectRepository(HoursDeclaration)
    private readonly hoursDeclarationRepository: Repository<HoursDeclaration>,
  ) {}

  async isPeriodAlreadyDeclared(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    const count = await this.hoursDeclarationRepository.count({
      where: { user: { id: userId }, startDate, endDate },
    });
    return count > 0;
  }

  async saveDeclaration(
    declaration: Partial<HoursDeclaration>,
  ): Promise<HoursDeclaration> {
    const newDeclaration = this.hoursDeclarationRepository.create(declaration);
    return this.hoursDeclarationRepository.save(newDeclaration);
  }
}
