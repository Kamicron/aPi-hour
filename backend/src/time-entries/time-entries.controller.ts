import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('time-entries')
@UseGuards(AuthGuard) // AuthGuard vérifie le token pour toutes les routes
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  // Créer une entrée de pointage
  @Post()
  async create(@Body() data: any, @Req() req: any) {
    const userId = req.user.userId; // Récupération de l'utilisateur connecté
    return this.timeEntriesService.create(userId, data);
  }

  // Modifier une entrée de pointage
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const userId = req.user.userId; // Récupération de l'utilisateur connecté
    const userRole = req.user.role; // Rôle de l'utilisateur
    return this.timeEntriesService.update(id, userId, userRole, data);
  }

  // Soft delete une entrée de pointage
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.timeEntriesService.softDelete(id, userId, userRole);
  }

  // Restaurer une entrée soft deleted (admin uniquement)
  @Patch('restore/:id')
  @UseGuards(RolesGuard)
  async restore(@Param('id') id: string) {
    return this.timeEntriesService.restore(id);
  }

  // Récupérer toutes les entrées de pointage
  @Get()
  async findAll(@Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.timeEntriesService.findAll(userId, userRole);
  }

  // Récupérer une entrée spécifique
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.timeEntriesService.findOne(id, userId, userRole);
  }

  // Démarrer une session
  @Post('start')
  start(@Req() req: any) {
    const userId = req.user.userId; // Récupérer l'utilisateur connecté
    return this.timeEntriesService.start(userId);
  }

  // Terminer une session
  @Patch(':id/end')
  end(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.timeEntriesService.end(id, userId);
  }
}
