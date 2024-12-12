/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { EditAccessGuard } from '../shared/guards/edit-access.guard.service';
import { DeleteAccessGuard } from '../shared/guards/delete-access.guard.service';
import { InUseGuard } from '../shared/guards/in-use.guard';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { Dataset } from '@luomus/laji-schema';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';

const type = KotkaDocumentObjectFullType.dataset;

@Controller(KotkaDocumentObjectType.dataset)
@ControllerType(type)
@InUseTypesSet([KotkaDocumentObjectFullType.document, KotkaDocumentObjectFullType.organization])
@UseGuards(
  AuthenticateCookieGuard,
  EditAccessGuard,
  DeleteAccessGuard,
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
