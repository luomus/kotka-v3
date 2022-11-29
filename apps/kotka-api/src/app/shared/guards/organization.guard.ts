/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api-services';
import { StoreObject } from '@kotka/shared/models';
import { allowAccessByOrganization } from '@kotka/utils';
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
    const type: string = this.reflector.get('controllerType', context.getClass());

    if (req.user.profile.role?.includes('MA.admin')) {
      return true;
    }

    if(req.method === 'POST') {
      const doc = req.body;

      if (!allowAccessByOrganization(doc, req.user.profile)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} with one of their own organizations as owner.`);
      }
    } else if (req.method === 'PUT' || req.method === 'DELETE') {

      const res = await lastValueFrom(this.lajiStoreService.get(type, req.params.id));

      if (!allowAccessByOrganization(res.data, req.user.profile)) {
        throw new ForbiddenException(`Uset may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }
    }

    return true;
  }
}
