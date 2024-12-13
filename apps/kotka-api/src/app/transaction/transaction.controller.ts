/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Controller, UseGuards } from '@nestjs/common';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { IntellectualOwnerMedia } from '../shared/decorators/intellectualOwnerMedia.decorator';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';

const type = KotkaDocumentObjectFullType.transaction;
const useTriplestore = false;

@Controller(KotkaDocumentObjectType.transaction)
@ControllerType(type)
@IntellectualOwnerMedia({ attachments: 'pdf', permitFile: 'pdf' })
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
export class TransactionController extends LajiStoreController<SpecimenTransaction> {
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
        useTriplestore
      );
  }
}
