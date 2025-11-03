/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { LajiStoreService } from '@kotka/api/services';
import { ErrorMessages, KotkaDocumentObjectFullType } from '@kotka/shared/models';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PostIDExistsInterceptor implements NestInterceptor {
  constructor(
    private readonly lajistoreSevice: LajiStoreService,
    private readonly reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest();

    if (req.body.id === undefined) {
        return next.handle();
    }

    const controllerType: KotkaDocumentObjectFullType = this.reflector.get('controllerType', context.getClass());

    try {
      await lastValueFrom(this.lajistoreSevice.get(controllerType, req.body.id));
    } catch (err) {
      if (err.response.status === 404) {
        return next.handle();
      } else {
        console.error(err);
        throw err;
      }
    }

    throw new BadRequestException(ErrorMessages.uniqueIDRequired);
  }
}
