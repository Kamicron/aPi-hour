import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    console.log('AuthGuard executed');
    console.log('Authenticated user:', user); // Vérifiez ce que contient user
    if (err || !user) {
      console.log('Error or no user:', err || info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
