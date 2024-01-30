/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { OrganizationGuard } from '../shared/guards/organization.guard';
import { TimedAccessSet } from '../shared/decorators/timed-access-set.decorator';
import { TimedDocumentAccessGuard } from '../shared/guards/timed-document-access.guard';
import { InUseGuard } from '../shared/guards/in-use.guard';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { Dataset } from '@luomus/laji-schema';

const type = 'GX.dataset';

@Controller('dataset')
@ControllerType(type)
@TimedAccessSet({ del: { 'd': 14 }})
@InUseTypesSet(['MY.document', 'MOS.organization'])
@UseGuards(
  AuthenticateCookieGuard,
  OrganizationGuard,
  TimedDocumentAccessGuard,
  InUseGuard  
)
export class DatasetController extends LajiStoreController<Dataset> {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
  ) {
      super(
        lajiStoreService,
        triplestoreService,
        triplestoreMapperService,
        type,
      );
  }
}
