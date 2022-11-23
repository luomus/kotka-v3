/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable()
export class InUseGuard implements CanActivate {
  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly lajistoreSevice: LajiStoreService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'DELETE') {
      return true;
    }
  
    const type = this.reflector.get('controllerType', context.getClass());
    const inUseTypes = this.reflector.get('inUseTypes', context.getClass());

    if (!inUseTypes) {
      return true;
    }

    const res = await lastValueFrom(this.triplestoreService.search({ object: req.params.id }, { format: 'JSON' }));

    //const res = await lastValueFrom(this.lajistoreSevice.getAll(type, req.params.id));
    const data = Object.keys(res.data['rdf:RDF']).filter(key => inUseTypes.includes(key));

    if (data && data.length > 0) {
      throw new ForbiddenException('Deletion target is in use.');
    }

    return true;
  }
}
