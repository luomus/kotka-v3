/*
https://docs.nestjs.com/interceptors#interceptors
*/

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class DateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const date = new Date().toISOString();

    if (req.method === 'POST') {
      req.body['dateCreated'] = date;
      req.body['dateEdited'] = date;
    } else if (req.method === 'PUT') {
      req.body['dateEdited'] = date;
    }

    return next.handle();
  }
}
