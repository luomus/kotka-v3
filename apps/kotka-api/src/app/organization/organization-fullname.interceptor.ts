/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { getOrganizationFullName } from '@kotka/shared/utils';
import { Organization } from '@luomus/laji-schema/models';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class OrganizationFullNameInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.method === 'POST' || req.method === 'PUT') {
      const fullName = getOrganizationFullName(req.body as Organization);
      req.body.fullName = fullName;
    }

    return next.handle();
  }
}
