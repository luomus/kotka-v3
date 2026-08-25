/*
https://docs.nestjs.com/guards#guards
*/

import { LajiStoreService } from '@kotka/api/services';
import {
  KotkaDocument,
  KotkaObjectFullType,
} from '@kotka/shared/models';
import { allowEditForUser, allowDeleteForUser } from '@kotka/shared/utils';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { Request } from 'express';
import { Branch } from '@luomus/laji-schema';

@Injectable()
export class ApiMethodAccessGuard implements CanActivate {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const type = this.reflector.get<KotkaObjectFullType>('controllerType', context.getClass());

    if (req.method === 'POST' && !req.path?.endsWith('_search')) {
      const doc = await this.getDocForEditAccessCheck(type, req.body);

      if (!allowEditForUser(doc, req.user.profile)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} with one of their own organizations as owner.`);
      }
    } else if (req.method === 'PUT') {
      const res = await lastValueFrom(this.lajiStoreService.get<KotkaDocument>(type, req.params.id));
      const doc = await this.getDocForEditAccessCheck(type, res.data);

      if (!allowEditForUser(doc, req.user.profile)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }

      req['oldDoc'] = res.data;
    } else if (req.method === 'DELETE') {
      if (!req.params.id) {
        throw new InternalServerErrorException('Missing expected id in url.');
      }

      const res = await lastValueFrom(this.lajiStoreService.get<KotkaDocument>(type, req.params.id));
      const doc = await this.getDocForEditAccessCheck(type, res.data);

      if (!allowEditForUser(doc, req.user.profile)) {
        throw new ForbiddenException(`User may only ${req.method} a ${type} which belongs to one of their own organizations.`);
      }

      if (!allowDeleteForUser(res.data, req.user.profile)) {
        throw new ForbiddenException(`Deletion is not allowed or time limit for ${type} ${req.method} has passed.`);
      }
    }

    return true;
  }

  private async getDocForEditAccessCheck(type: KotkaObjectFullType, source: Partial<KotkaDocument>): Promise<Partial<KotkaDocument> | undefined> {
    if (type === KotkaObjectFullType.branch) {
      const accessionID = (<Partial<Branch>>source).accessionID;
      if (!accessionID) {
        throw new UnprocessableEntityException('Branch document must contain accessionID.');
      }
      return (await lastValueFrom(
        this.lajiStoreService.get<KotkaDocument>(KotkaObjectFullType.document, accessionID),
      )).data;
    }

    return source;
  }
}
