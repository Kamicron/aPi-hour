import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoursDeclarationController } from './hours-declaration.controller';
import { HoursDeclarationService } from './hours-declaration.service';
import { HoursDeclaration } from './entities/hours-declaration.entity';
import { UserSessionsService } from '../user_sessions/user_sessions.service';
import { TimeEntriesService } from '../time-entries/time-entries.service';
import { UserSession } from '../user_sessions/entities/user_session.entity';
import { TimeEntry } from '../time-entries/entities/time-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HoursDeclaration, UserSession, TimeEntry]),
  ],
  controllers: [HoursDeclarationController],
  providers: [HoursDeclarationService, UserSessionsService, TimeEntriesService],
})
export class HoursDeclarationModule {}
