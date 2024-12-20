import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { PausesModule } from './pauses/pauses.module';
import { UserSessionsModule } from './user_sessions/user_sessions.module';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('process.env.DB_HOST', process.env.DB_HOST);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Ne pas utiliser en production
    }),
    UserModule,
    AuthModule,
    TimeEntriesModule,
    PausesModule,
    UserSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
