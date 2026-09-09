/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Document } from '@kotka/shared/models';
import { parseJSONPointer } from '@kotka/shared/utils';

@Injectable()
export class ClearUncertainFieldOrphansInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<Document> {
    const req = context.switchToHttp().getRequest();
    const body: Document = req.body;

    if (!((req.method === 'POST' && !req.path?.includes('_search')) || req.method === 'PUT')) {
      return next.handle();
    }

    let unrealiableFields = body.unreliableFields as unknown as string[] | undefined;

    if (unrealiableFields === undefined) {
      return next.handle();
    }

    unrealiableFields = unrealiableFields.filter(field => {
      const value = parseJSONPointer(body, field);

      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        return false;
      }

      return true;
    });

    if (unrealiableFields.length !== 0) {
      //@ts-ignore
      body.unreliableFields = unrealiableFields;
    } else {
      delete body.unreliableFields;
    }

    return next.handle();
  }
}
