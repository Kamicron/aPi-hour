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

  // ===========================================
  //              ROUTES EXPLICITES
  // ===========================================

  // Accessible uniquement aux admins
  @UseGuards(AuthGuard, RolesGuard) // Les deux guards doivent être appliqués
  @Get()
  async findAll(@Req() req: any): Promise<User[]> {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource.');
    }
    return this.userService.findAll();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: any) {
    console.log('profile', req.user);

    return this.userService.findOne(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Patch('settings')
  async updateSettings(@Req() req: any, @Body() settings: any) {
    console.log('updateSettings: Method called');
    console.log('Request body:', settings);
    console.log('Request headers:', req.headers);

    // Remplacement temporaire si req.user est undefined
    const userId = req.user?.userId; // Par défaut, un userId de test
    console.log('Extracted userId:', req.user.userId);

    if (!userId) {
      throw new UnauthorizedException('Invalid token or userId not found');
    }

    return this.userService.updateSettings(userId, settings);
  }

  @UseGuards(AuthGuard)
  @Patch('me/working-days')
  async updateWorkingDays(
    @Req() req: any,
    @Body() body: { workingDays: number[] },
  ) {
    const userId = req.user.userId; // ID de l'utilisateur connecté
    return this.userService.updateWorkingDays(userId, body.workingDays);
  }

  // ===========================================
  //              ROUTES DYNAMIQUES
  // ===========================================

  // Accessible uniquement au propriétaire ou aux admins
  @UseGuards(AuthGuard)
  @Delete(':id')
  async softDelete(@Param('id') id: string, @Req() req: any): Promise<void> {
    const user = await this.userService.findOne(id);
    console.log('delete');

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

  // Accessible uniquement au propriétaire ou aux admins
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<User> {
    console.log(':id');

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
    console.log('ediit');

    // Vérification des permissions
    if (req.user.userId !== user.id && req.user.role !== 'admin') {
      throw new UnauthorizedException(
        `You do not have permission to modify this account.`,
      );
    }

    // Si l'utilisateur connecté est autorisé
    return this.userService.update(id, userData);
  }
}
