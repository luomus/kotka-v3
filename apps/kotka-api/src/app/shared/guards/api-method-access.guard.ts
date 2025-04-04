/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api/services';
import { KotkaDocumentObject } from '@kotka/shared/models';
import { allowEditForUser, allowDeleteForUser } from '@kotka/shared/utils';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ApiMethodAccessGuard implements CanActivate {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const handler = context.getHandler().name;
    const type: string = this.reflector.get('controllerType', context.getClass());

    if (req.method === 'POST' && handler === 'post') {
      const doc = req.body;

      if (!allowEditForUser(doc, req.user.profile)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} with one of their own organizations as owner.`);
      }
    } else if (req.method === 'PUT') {
      const res = await lastValueFrom(this.lajiStoreService.get<KotkaDocumentObject>(type, req.params.id));

      if (!allowEditForUser(res.data, req.user.profile)) {
        throw new ForbiddenException(`Uset may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }

      req['oldDoc'] = res.data;
    } else if (req.method === 'DELETE') {
      if (!req.params.id) {
        throw new InternalServerErrorException('Missing expected id in url.');
      }

      const res = await lastValueFrom(this.lajiStoreService.get<KotkaDocumentObject>(type, req.params.id));

      if (!allowEditForUser(res.data, req.user.profile)) {
        throw new ForbiddenException(`Uset may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }

      if (!allowDeleteForUser(res.data, req.user.profile)) {
        throw new ForbiddenException(`Deletion is not allowed or time limit for ${type} ${req.method} has passed.`);
      }
    }

    return true;
  }
}
