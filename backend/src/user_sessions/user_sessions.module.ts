import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user_session.entity';
import { UserSessionsService } from './user_sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  providers: [UserSessionsService],
  exports: [UserSessionsService, TypeOrmModule], // Exportez également TypeOrmModule si nécessaire
})
export class UserSessionsModule {}
