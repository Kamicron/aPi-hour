import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('______________');
    console.log('Incoming Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });
    console.log('______________');

    next(); // Passe la requête au prochain middleware ou contrôleur
  }
}
