import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule, // Utilise UserService depuis UserModulez
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_KEY || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController], // Déclare le contrôleur ici
  exports: [AuthService], // Exporte uniquement les services nécessaires, pas les contrôleurs
})
export class AuthModule {}
