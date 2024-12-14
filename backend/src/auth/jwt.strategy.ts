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
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role }; // Inclut l'ID et le rôle de l'utilisateur dans req.user
  }
}
