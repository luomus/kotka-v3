/*
https://docs.nestjs.com/interceptors#interceptors
*/

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnprocessableEntityException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ValidationService } from '@kotka/api/services';
import { ApiValidationError, KotkaObjectFullType } from '@kotka/shared/models';

@Injectable()
export class ValidatorInterceptor implements NestInterceptor {
  constructor (
    private readonly reflector: Reflector,
    private readonly validationService: ValidationService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const type: KotkaObjectFullType = this.reflector.get('controllerType', context.getClass());

    if (!req.body) {
      throw new UnprocessableEntityException('No request body to validate.');
    }

    const errors = await this.validationService.validate(req.body, type);

    if (errors) {
      const errorResponse: ApiValidationError = {
        errorCode: 'VALIDATION_EXCEPTION',
        details: Object.keys(errors).reduce((result, key) => {
          const newKey = key.replace(/\[(\d+)]/g, '/$1').replace(/\./g, '/');
          result[newKey] = errors[key];
          return result;
        }, {}),
      };

      throw new UnprocessableEntityException(errorResponse);
    }

    return next.handle();
  }
}
