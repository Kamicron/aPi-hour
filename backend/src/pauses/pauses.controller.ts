import {
  Controller,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Body,
  Delete,
} from '@nestjs/common';
import { PausesService } from './pauses.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('pauses')
@UseGuards(AuthGuard)
export class PausesController {
  constructor(private readonly pausesService: PausesService) {}

  @Patch(':id/start')
  addPause(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.pausesService.addPause(id, userId);
  }

  @Patch(':id/add-with-dates')
  async addPauseWithDates(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const { pauseStart, pauseEnd } = body;

    if (!pauseStart) {
      throw new BadRequestException('Pause start time is required');
    }

    return this.pausesService.addPauseWithDates(
      id,
      userId,
      pauseStart,
      pauseEnd,
    );
  }

  @Patch(':id/update')
  async updatePause(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const { pauseStart, pauseEnd } = body;

    if (!pauseStart) {
      throw new BadRequestException('Pause start time is required');
    }

    return this.pausesService.updatePause(id, userId, pauseStart, pauseEnd);
  }

  @Patch(':id/resume')
  resumePause(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.pausesService.resumePause(id, userId);
  }

  @Delete(':id')
  async softDeletePause(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.pausesService.softDeletePause(id, userId, userRole);
  }

  @Patch('restore/:id')
  @UseGuards(RolesGuard) // Par exemple, seulement les admins peuvent restaurer
  async restorePause(@Param('id') id: string) {
    return this.pausesService.restorePause(id);
  }
}
