/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { ErrorMessages } from '@kotka/api-interfaces';
import { KotkaDocumentObjectFullType, STORE_OBJECTS, StoreObject } from '@kotka/shared/models';

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

    let triplestoreSearchResponse;
    let found = false;

    for (const type of inUseTypes) {
      if (STORE_OBJECTS.includes(type as KotkaDocumentObjectFullType)) {
        const res = await lastValueFrom(this.lajistoreSevice.getAll<StoreObject>(type, { q: req.params.id, fields: 'id' }));
        if (res.data.member.length > 0 && !(res.data.member.length === 1 && res.data.member[0].id === req.params.id)) {
          found = true;
          break;
        }
      } else {
        if (!triplestoreSearchResponse) triplestoreSearchResponse = await lastValueFrom(this.triplestoreService.search({ object: req.params.id }, { format: 'JSON' }));

        const data = Object.keys(triplestoreSearchResponse.data['rdf:RDF']).filter(key => inUseTypes.includes(key) && !STORE_OBJECTS.includes(key as KotkaDocumentObjectFullType));
        if (data && data.length > 0) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      throw new ForbiddenException(ErrorMessages.deletionTargetInUse);
    }

    return true;
  }
}
