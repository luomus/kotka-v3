/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Document } from '@kotka/shared/models';
import { NamespaceService } from '../shared/services/namespace.service';
import { defaultPrefix } from '@kotka/shared/utils';

@Injectable()
export class SpecimenIdJoinerInterceptor implements NestInterceptor {
  constructor (
    private readonly namespaceService: NamespaceService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest();

    if (req.method !== 'POST') {
      return next.handle();
    }

    const {namespaceID, objectID, ...body} = req.body as (Document & { namespaceID: string, objectID: string });

    if (!namespaceID && !objectID) {
      return next.handle();
    }

    if (namespaceID && !objectID) throw new HttpException('objectID must be set if namespaceID is set', HttpStatus.BAD_REQUEST);
    if (!namespaceID && objectID) throw new HttpException('namespaceID must be set if objectID is set', HttpStatus.BAD_REQUEST);

    const namespaces = await this.namespaceService.getNamespaces();

    let finalNamespaceID: string;

    if (namespaceID.includes(':')) {
      finalNamespaceID = namespaceID;

      if (namespaceID.startsWith(defaultPrefix)) {
        finalNamespaceID = namespaceID.split(':')[1];
      } else {
        finalNamespaceID = namespaceID;
      }
    } else {
      const namespace = namespaces.find(namespace => namespace.namespace_id === namespaceID);

      if (!namespace) {
        throw new InternalServerErrorException('Given namespace unknown.');
      }

      if (
        namespace.qname_prefix !== '' &&
        namespace.qname_prefix !== 'tun' &&
        namespace.qname_prefix !== 'all'
      ) {
        finalNamespaceID = `${namespace.qname_prefix}:${namespaceID}`;
      } else {
        finalNamespaceID = namespaceID;
      }
    }

    req.body = { ...body, id: `${finalNamespaceID}.${objectID}` };
    return next.handle();
  }
}
