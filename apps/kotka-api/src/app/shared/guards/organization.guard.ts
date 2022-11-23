/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api-services';
import { StoreObject } from '@kotka/shared/models';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector
  ) {}
  
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const type = this.reflector.get('controllerType', context.getClass());

    if(req.method === 'POST') {
      const doc = req.body;

      if (!req.user.profile.organisation.includes(doc.owner)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} with one of their own organizations as owner.`);
      }
    } else if (req.method === 'PUT' || (req.method === 'DELETE' && !req.user.profile.role.includes('MA.admin'))) {

      const res = await lastValueFrom(this.lajiStoreService.get(type, req.params.id));

      if (!req.user.profile.organisation.includes(res.data.owner)) {
        throw new ForbiddenException(`Uset may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }
    }

    return true;
  }
}
