import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private readonly authService: AuthService) {}

  @Post('generate')
  generateToken(@Body() { sub, role }: { sub: string; role: string }) {
    const payload = { sub, role };
    const token = this.jwtService.sign(payload);
    return { access_token: token };
  }

  @Post('validate')
  validateToken(@Body() { token }: { token: string }) {
    try {
      const secret = process.env.JWT_KEY || 'defaultSecret';
      const decoded = jwt.verify(token, secret);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  @Post('login')
  async login(
    @Body() { email, password }: { email: string; password: string },
  ) {
    return this.authService
      .validateUser(email, password)
      .then((user) => this.authService.login(user));
  }
}
