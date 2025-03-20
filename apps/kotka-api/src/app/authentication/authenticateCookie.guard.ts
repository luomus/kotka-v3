/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ErrorMessages } from '@kotka/shared/models';

@Injectable()
export class AuthenticateCookieGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.isAuthenticated()) {
      return true;
    } else {
      throw new UnauthorizedException(ErrorMessages.loginRequired);
    }
  }
}
