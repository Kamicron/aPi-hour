import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  console.log('process.env.PORT', process.env.PORT);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3001', 'https://hour.pi-cto.top'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
