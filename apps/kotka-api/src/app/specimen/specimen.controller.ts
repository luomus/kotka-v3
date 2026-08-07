/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, OldKotkaApiService, TriplestoreService, ValidationService } from '@kotka/api/services';
import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { KotkaDocumentFullType, KotkaRootDocumentType } from '@kotka/shared/models';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { TriplestoreMapperService } from '@kotka/api/services';
import { SpecimenIdJoinerInterceptor } from './interceptors/specimen-id-joiner.interceptor';
import { SpecimenConvertDataToOldFormatInterceptor } from './interceptors/specimen-convert-data-to-old-format.interceptor';
import { SpecimenImageInterceptor } from './interceptors/specimen-image.interceptor';
import { CoordinateMatchInterceptor } from './interceptors/coordinate-match.interceptor';
import { ClearUncertainFieldOrphansInterceptor } from './interceptors/clear-uncertain-field-orphans.interceptor';
import { AssociatedTaxaToUnitInterceptor } from './interceptors/associated-taxa-to-unit.interceptor';
import { CollectionAccessibleToUserInterceptor } from './interceptors/collection-accessible-to-user.interceptor';

const type = KotkaDocumentFullType.document;

@Controller(KotkaRootDocumentType.specimen)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
@UseInterceptors(
  ClearUncertainFieldOrphansInterceptor,
  CoordinateMatchInterceptor,
  AssociatedTaxaToUnitInterceptor,
  CollectionAccessibleToUserInterceptor,
  SpecimenConvertDataToOldFormatInterceptor,
  SpecimenIdJoinerInterceptor,
  SpecimenImageInterceptor,
)
export class SpecimenController extends LajiStoreController<Document> {
  constructor(
    private readonly oldKotkaApiService: OldKotkaApiService,
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

  @Get('range/:range')
  async getRange(@Param('range') range: string) {
    return await lastValueFrom(this.oldKotkaApiService.getRange(range));
  }
}
