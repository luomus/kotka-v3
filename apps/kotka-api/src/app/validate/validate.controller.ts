/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, InternalServerErrorException, Post, Req, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ValidationService } from '../shared/services/validation.service';
import { isEmpty } from 'lodash';

@Controller('validate')
@UseGuards(AuthenticateCookieGuard)
export class ValidateController {
  constructor(
    private readonly validationService: ValidationService
  ) {};

  @Post()
  async validateRequest(@Req() req) {
    let errors;
    try {
      errors = await this.validationService.remoteValidate(req.query, { body: JSON.stringify(req.body) });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(e.message);
    }

    if (errors && !isEmpty(errors)) {
      throw new UnprocessableEntityException(errors);
    }
  }
}
