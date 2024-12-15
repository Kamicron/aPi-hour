import { Controller, Patch, Param, UseGuards, Req } from '@nestjs/common';
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

  @Patch(':id/resume')
  resumePause(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.pausesService.resumePause(id, userId);
  }
}
