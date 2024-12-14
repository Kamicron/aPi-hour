import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Accessible uniquement aux admins
  @UseGuards(AuthGuard, RolesGuard) // Les deux guards doivent être appliqués
  @Get()
  async findAll(@Req() req: any): Promise<User[]> {
    console.log('Inside findAll controller'); // Ajouter un log pour vérifier si ce point est atteint
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
    return this.userService.findAll();
  }

  // Accessible uniquement au propriétaire ou aux admins
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<User> {
    const user = await this.userService.findOne(id);

    // Vérification : propriétaire ou admin
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('You do not have access to this resource.');
    }
    return user;
  }

  // Accessible à tout le monde pour créer un utilisateur
  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  // Accessible uniquement au propriétaire ou aux admins
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
    @Req() req: any,
  ): Promise<User> {
    const user = await this.userService.findOne(id);

    // Vérification : propriétaire ou admin
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('You do not have access to this resource.');
    }
    return this.userService.update(id, userData);
  }

  // Accessible uniquement au propriétaire ou aux admins
  @UseGuards(AuthGuard)
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any): Promise<void> {
    const user = await this.userService.findOne(id);

    // Vérification : propriétaire ou admin
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      throw new ForbiddenException('You do not have access to this resource.');
    }
    return this.userService.softDelete(id);
  }

  // Accessible uniquement aux admins
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('restore/:id')
  async restore(@Param('id') id: string, @Req() req: any): Promise<void> {
    console.log('test');

    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can restore users.');
    }
    return this.userService.restore(id);
  }
}
