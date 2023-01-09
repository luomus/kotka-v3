/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { FormService } from '@kotka/api-services';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnprocessableEntityException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Ajv from 'ajv';
import * as lajiValidate from 'laji-validate';
import { ValidationService } from '../services/validation.service';

@Injectable()
export class ValidatorInterceptor implements NestInterceptor {
  //@ts-ignore
  private readonly ajv: Ajv;

  constructor (
    private readonly reflector: Reflector,
    private readonly formService: FormService,
    private readonly validationService: ValidationService
  ) {
    this.ajv = new Ajv({ 
      allErrors: true,
    });

    lajiValidate.extend(lajiValidate.validators.remote, {
      fetch: (path, query, options) => {
        return this.validationService.remoteValidate(query, options);
      }
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const type: string = this.reflector.get('controllerType', context.getClass());
    const form = await this.formService.getForm(type);

    if (!req.body) {
      throw new UnprocessableEntityException('No request body to validate.');
    }
    const errors = {};

    if (form.schema && !this.ajv.validate(form.schema, req.body)) {
  
      this.ajv.errors.map(error => {
        if (!errors[error.instancePath]) {
          errors[error.instancePath] = [];
        }
        let message = error.message;
        if (error.keyword === 'enum' && error.params && error.params.allowedValues) {
          message += ` '${error.params.allowedValues.join(`', '`)}.`;
        }
        errors[error.instancePath].push(message);

      });
      throw new UnprocessableEntityException('Unprocessable Entity', this.formatErrorDetails(errors, undefined));
    }

    if (form.validators) {
      try {
        await lajiValidate.async(req.body, form.validators);
      } catch (err) {
        Object.keys(err).map(key => {
          if (Array.isArray(err[key])) {
            if (typeof err[key][0] === 'string') {
              const path1 = key.startsWith('.')? key : '.' + key;
              if (!errors[path1]) {
                errors[path1] = [];
              }
              errors[path1].push(...err[key]);
            } else if (typeof err[key][0] === 'object') {
              err[key].map(obj => {
                Object.keys(obj).map((path) => {
                  const path1 = path.startsWith('.')? path : '.' + path;
                  if (!errors[path1]) {
                    errors[path1] = [];
                  }
                  errors[path1].push(...obj[path]);
                });
              });
            } else {
              console.error('Could not interpret the error message');
            }
          }
        });
        throw new UnprocessableEntityException('Unprocessable Entity', this.formatErrorDetails(errors, undefined));
      }
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
