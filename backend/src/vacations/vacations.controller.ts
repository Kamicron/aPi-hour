import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VacationsService } from './vacations.service';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { UpdateVacationDto } from './dto/update-vacation.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('vacations')
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateVacationDto) {
    return await this.vacationsService.createVacation(req.user.userId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('my')
  async findMyVacations(@Req() req) {
    return await this.vacationsService.findUserVacations(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return await this.vacationsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVacationDto) {
    return await this.vacationsService.updateVacation(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.vacationsService.deleteVacation(id);
  }
}
