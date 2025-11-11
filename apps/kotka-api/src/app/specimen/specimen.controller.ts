/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, OldKotkaApiService, TriplestoreService } from '@kotka/api/services';
import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { TriplestoreMapperService } from '@kotka/api/mappers';
import { SpecimenIdJoinerInterceptor } from './specimen-id-joiner.interceptor';
import { SpecimenConvertDataToOldFormatInterceptor } from './specimen-convert-data-to-old-format.interceptor';
import { SpecimenImageInterceptor } from './specimen-image.interceptor';

const type = KotkaDocumentObjectFullType.document;

@Controller(KotkaDocumentObjectType.specimen)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
@UseInterceptors(
  SpecimenConvertDataToOldFormatInterceptor,
  SpecimenIdJoinerInterceptor,
  SpecimenImageInterceptor,
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
      false
    );
  }

  @Get('range/:range')
  async getRange(@Param('range') range: string) {
    return await lastValueFrom(this.oldKotkaApiService.getRange(range));
  }
}
