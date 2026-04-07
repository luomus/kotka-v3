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
import { KotkaDocumentObjectFullType } from '@kotka/shared/models';

@Injectable()
export class ValidatorInterceptor implements NestInterceptor {
  constructor (
    private readonly reflector: Reflector,
    private readonly validationService: ValidationService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const type: KotkaDocumentObjectFullType = this.reflector.get('controllerType', context.getClass());

    if (!req.body) {
      throw new UnprocessableEntityException('No request body to validate.');
    }

    const errors = await this.validationService.validate(req.body, type);

    if (errors) {
      throw new UnprocessableEntityException('Unprocessable Entity', this.formatErrorDetails(errors, undefined));
    }

    return next.handle();
  }

  formatErrorDetails(errors, targetType) {
    switch (targetType) {
      case 'jsonPath':
        return errors;
      default:
        return this.errorsToObj(errors);
    }
  }

  errorsToObj(errors) {
    const result = {};
    Object.keys(errors).map(path => {
      const re = /[.[\]]/;
      const parts = path.split(re).filter(value => value !== '');
      let pointer = result;
      let now = parts.shift();
      while (parts.length > 0) {
        if (!pointer[now]) {
          pointer[now] = {};
        }
        pointer = pointer[now];
        now = parts.shift();
      }
      pointer[now] = {errors: errors[path]};
    });
    return result;
  }
}
