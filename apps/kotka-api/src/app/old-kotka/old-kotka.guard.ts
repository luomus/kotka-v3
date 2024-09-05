/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class OldKotkaGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authorization = process.env.OLD_KOTKA_AUTH;

    if (!authorization) return false;

    const req: Request = context.switchToHttp().getRequest();

    if(req.headers.authorization !== authorization) return false;

    return true;
  }
}
