import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationsService } from './vacations.service';
import { VacationsController } from './vacations.controller';
import { Vacation } from './entities/vacation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacation])],
  controllers: [VacationsController],
  providers: [VacationsService],
  exports: [TypeOrmModule], // Exporte TypeOrmModule pour que d'autres modules puissent utiliser VacationRepository
})
export class VacationsModule {}
