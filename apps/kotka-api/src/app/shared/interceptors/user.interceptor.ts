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
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const user = req.user.profile.id;

    if (req.method === 'POST') {
      req.body['creator'] = user;
      req.body['editor'] = user;
    } else if (req.method === 'PUT') {
      req.body['editor'] = user;
    }

    return next.handle();
  }
}
