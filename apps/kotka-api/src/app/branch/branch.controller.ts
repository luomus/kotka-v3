/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, TriplestoreService, ValidationService } from '@kotka/api/services';
import { Body, Controller, Param, Post, Put, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { TriplestoreMapperService } from '@kotka/api/services';
import { ValidatorInterceptor } from '../shared/interceptors/validator.interceptor';
import { MediaIntellectualOwnerInterceptor } from '../shared/interceptors/media-intellectual-owner.interceptor';
import { Branch } from '@luomus/laji-schema';

const type = KotkaDocumentObjectFullType.branch;

@Controller(KotkaDocumentObjectType.branch)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
export class BranchController extends LajiStoreController<Branch> {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly validationService: ValidationService,
  ) {
    super(
      lajiStoreService,
      triplestoreService,
      triplestoreMapperService,
      validationService,
      type,
      false
    );
  }

  @UseInterceptors(ValidatorInterceptor, MediaIntellectualOwnerInterceptor)
  @Post()
  override async post(@Req() req, @Body() body: Branch) {
    return super.post(req, body);
  }

  @UseInterceptors(ValidatorInterceptor, MediaIntellectualOwnerInterceptor)
  @Put(':id')
  override async put(@Req() req, @Param('id') id: string, @Body() body: Branch) {
    return super.put(req, id, body);
  }
}
