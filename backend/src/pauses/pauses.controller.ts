import {
  Controller,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { PausesService } from './pauses.service';
import { AuthGuard } from '../auth/auth.guard';

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
}
