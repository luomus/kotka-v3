/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api-services';
import { Injectable, CanActivate, ExecutionContext, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import * as moment from 'moment';
import { allowAccessByTime } from '@kotka/shared/utils';

@Injectable()
export class TimedDocumentAccessGuard implements CanActivate {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.user.profile.role.includes('MA.admin')) {
      return true;
    }

    const type = this.reflector.get('controllerType', context.getClass());
    const timedAccessMetadata = this.reflector.get('timedAccessMetadata', context.getClass())?.[context.getHandler().name];

    if (!timedAccessMetadata) {
      return true;
    }

    if (!req.params.id) {
      throw new InternalServerErrorException('Missing expected id in url.');
    }

    const res = await lastValueFrom(this.lajiStoreService.get(type, req.params.id));

    if (!allowAccessByTime(res.data, timedAccessMetadata)) {
      throw new ForbiddenException(`Time limit for ${type} ${req.method} has passed.`);
    }

    return true;
  }
}
