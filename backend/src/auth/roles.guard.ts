import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Récupère req.user injecté par JwtStrategy

    console.log('User in RolesGuard:', user); // Log des informations utilisateur

    if (!user || !user.role) {
      throw new ForbiddenException('You do not have access to this resource.');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this resource.');
    }

    return true;
  }
}
