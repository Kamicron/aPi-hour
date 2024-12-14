import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    console.log('User from DB:', user);

    if (!user || !user.password) {
      console.log('User not found or password missing');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
