/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, OldKotkaApiService, TriplestoreService } from '@kotka/api/services';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { TriplestoreMapperService } from '@kotka/api/mappers';

const type = KotkaDocumentObjectFullType.document;

@Controller(KotkaDocumentObjectType.specimen)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
export class SpecimenController extends LajiStoreController<Document> {
  constructor(
    private readonly oldKotkaApiService: OldKotkaApiService,
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService
  ) {
    super(
      lajiStoreService,
      triplestoreService,
      triplestoreMapperService,
      type,
    );
  }

  @Get('range/:range')
  async getRange(@Param('range') range: string) {
    return await lastValueFrom(this.oldKotkaApiService.getRange(range));
  }
}
