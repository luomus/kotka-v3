/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api-services';
import { Injectable, CanActivate, ExecutionContext, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { allowDeleteForUser } from '@kotka/utils';
import { KotkaDocumentObject } from '@kotka/shared/models';

@Injectable()
export class DeleteAccessGuard implements CanActivate {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'DELETE') {
      return true;
    }

    const type = this.reflector.get('controllerType', context.getClass());

    if (!req.params.id) {
      throw new InternalServerErrorException('Missing expected id in url.');
    }

    const res = await lastValueFrom(this.lajiStoreService.get(type, req.params.id));

    if (!allowDeleteForUser(<KotkaDocumentObject>res.data, req.user.profile)) {
      throw new ForbiddenException(`Deletion is not allowed or time limit for ${type} ${req.method} has passed.`);
    }

    return true;
  }
}
