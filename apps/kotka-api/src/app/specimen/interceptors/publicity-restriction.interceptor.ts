import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PublicityRestrictionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.method === 'PUT' || (req.method === 'POST' && !req.path?.includes('_search'))) {
      const body = req.body;

      if (body.publicityRestrictions === undefined) {
        body.publicityRestrictions = 'MZ.publicityRestrictionsPublic';
      }
    }

    return next.handle();
  }
}
