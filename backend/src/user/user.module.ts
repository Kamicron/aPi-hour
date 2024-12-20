import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserSessionsModule } from 'src/user_sessions/user_sessions.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserSessionsModule], // Enregistre l'entité dans TypeORM
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
