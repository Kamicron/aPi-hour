import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken'; // Remplacement de require()
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];
    console.log('Authorization Header:', authorization); // Log pour vérifier si l'Authorization est envoyé

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authorization.split(' ')[1];
    console.log('Extracted Token:', token); // Log pour voir le token extrait

    try {
      const decoded = this.validateToken(token);
      console.log('Decoded Token:', decoded); // Log le contenu du token après validation
      request.user = decoded; // Ajoute les informations utilisateur dans la requête
      return true;
    } catch (err) {
      console.log('Error in AuthGuard:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validateToken(token: string) {
    const secret = process.env.JWT_KEY || 'defaultSecret';
    console.log('secret', secret);

    return jwt.verify(token, secret); // Utilisation de jwt.verify
  }
}
