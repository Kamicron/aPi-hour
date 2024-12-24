// Backend: Gestion des heures supplémentaires déclarées adaptées à votre structure

import { Controller, Post, Body, Param } from '@nestjs/common';
import { TimeEntriesService } from '../time-entries/time-entries.service';
import { UserSessionsService } from '../user_sessions/user_sessions.service';
import { HoursDeclarationService } from './hours-declaration.service';

@Controller('hours-declaration')
export class HoursDeclarationController {
  constructor(
    private readonly timeEntriesService: TimeEntriesService,
    private readonly userSessionsService: UserSessionsService,
    private readonly hoursDeclarationService: HoursDeclarationService,
  ) {}

  // 1. Calcul des heures supplémentaires entre deux dates
  @Post(':userId/calculate')
  async calculateOvertime(
    @Param('userId') userId: string,
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
  ): Promise<{
    workedHours: number;
    pauseHours: number;
    contractualHours: number;
    extraHours: number;
  }> {
    // Récupérer les heures travaillées et les pauses via le service existant
    const workingEntries =
      await this.timeEntriesService.getTimeEntriesBetweenDates(
        userId,
        startDate,
        endDate,
      );
    const pauseEntries = await this.timeEntriesService.getPausesBetweenDates(
      userId,
      startDate,
      endDate,
    );

    // Calcul des heures nettes
    const workedHours =
      this.timeEntriesService.calculateTotalHours(workingEntries);
    const pauseHours =
      this.timeEntriesService.calculateTotalHours(pauseEntries);
    const netWorkedHours = workedHours - pauseHours;

    // Récupérer la configuration utilisateur via UserSessionsService
    const userSession = await this.userSessionsService.findOne(userId);
    const contractualHours = userSession.contractualMonthlyHours || 0;

    // Calcul des heures supplémentaires
    const extraHours = netWorkedHours - contractualHours;

    return {
      workedHours: netWorkedHours,
      pauseHours,
      contractualHours,
      extraHours,
    };
  }

  // 2. Enregistrement d'une période déclarée
  @Post(':userId/declare')
  async declareOvertime(
    @Param('userId') userId: string,
    @Body()
    {
      startDate,
      endDate,
      workedHours,
      pauseHours,
      contractualHours,
      extraHours,
    }: {
      startDate: string;
      endDate: string;
      workedHours: number;
      pauseHours: number;
      contractualHours: number;
      extraHours: number;
    },
  ): Promise<{ message: string }> {
    // Vérifier les doublons via HoursDeclarationService
    const isAlreadyDeclared =
      await this.hoursDeclarationService.isPeriodAlreadyDeclared(
        userId,
        startDate,
        endDate,
      );
    if (isAlreadyDeclared) {
      throw new Error('Cette période a déjà été déclarée.');
    }

    // Enregistrer la déclaration dans une table dédiée
    await this.hoursDeclarationService.saveDeclaration({
      userId,
      startDate,
      endDate,
      workedHours,
      pauseHours,
      contractualHours,
      extraHours,
    });

    return {
      message: 'Période déclarée avec succès',
    };
  }
}
