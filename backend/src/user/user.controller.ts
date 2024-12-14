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
  UnauthorizedException,
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
    console.log('req.user:', req.user); // Vérifiez que req.user contient userId et role
    console.log('Param id:', id);

    const user = await this.userService.findOne(id);
    console.log('User from DB:', user);

    // Vérification des permissions
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      throw new UnauthorizedException(
        `You do not have permission to modify this account. Connected user: ${req.user.userId}, Target account: ${user.id}`,
      );
    }

    // Si l'utilisateur connecté est autorisé
    return this.userService.update(id, userData);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<User> {
    return this.userService.findOne(req.user.userId); // Retourne les informations de l'utilisateur connecté
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
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can restore users.');
    }
    return this.userService.restore(id);
  }
}
