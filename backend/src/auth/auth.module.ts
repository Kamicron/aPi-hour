import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('auth process.env.JWT_KEY', process.env.JWT_KEY);

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Enregistrez 'jwt' comme stratégie par défaut
    JwtModule.register({
      secret: process.env.JWT_KEY || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // Assurez-vous que JwtStrategy est inclus ici
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
