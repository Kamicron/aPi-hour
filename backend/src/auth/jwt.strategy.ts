import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_KEY || 'defaultSecret',
    });
    console.log('JwtStrategy registered');
  }

  async validate(payload: any) {
    console.log('Payload in JwtStrategy:', payload); // Assurez-vous que le token est correctement décodé
    return { userId: payload.sub, role: payload.role, name: payload.name }; // Injecté dans req.user
  }
}
