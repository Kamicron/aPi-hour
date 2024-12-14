import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('jwt process.env.JWT_KEY', process.env.JWT_KEY);


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_KEY || 'defaultSecret',
    });
    console.log('JwtStrategy registered'); // Ajoutez ce log pour vérifier si la stratégie est chargée
  }

  async validate(payload: any) {
    console.log('Payload in JwtStrategy:', payload); // Vérifiez le contenu du payload ici
    return { userId: payload.sub, role: payload.role }; // Retournez un objet clair avec userId et role
  }
}
