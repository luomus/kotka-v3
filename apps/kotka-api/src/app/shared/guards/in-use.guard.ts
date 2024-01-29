/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { ErrorMessages } from '@kotka/api-interfaces';

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

    this.reflector.get('controllerType', context.getClass());
    const inUseTypes: Array<string> = this.reflector.get('inUseTypes', context.getClass());

    if (inUseTypes.length === 0 || !inUseTypes) {
      return true;
    }

    const res = await lastValueFrom(this.triplestoreService.search({ object: req.params.id }, { format: 'JSON' }));

    //const res = await lastValueFrom(this.lajistoreSevice.getAll(type, req.params.id));
    const data = Object.keys(res.data['rdf:RDF']).filter(key => inUseTypes.includes(key));

    if (data && data.length > 0) {
      throw new ForbiddenException(ErrorMessages.deletionTargetInUse);
    }

    return true;
  }
}
