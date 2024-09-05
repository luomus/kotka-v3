/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Controller, UseGuards } from '@nestjs/common';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { TimedAccessSet } from '../shared/decorators/timed-access-set.decorator';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { TimedDocumentAccessGuard } from '../shared/guards/timed-document-access.guard';
import { OrganizationGuard } from '../shared/guards/organization.guard';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { IntellectualOwnerMedia } from '../shared/decorators/intellectualOwnerMedia.decorator';

const type = 'HRX.specimenTransaction';
const useTriplestore = false;

@Controller('transaction')
@ControllerType(type)
@TimedAccessSet({ del: { 'd': 14 }})
@InUseTypesSet(['MY.document', 'MOS.organization'])
@IntellectualOwnerMedia({ attachments: 'pdf', permitFile: 'pdf' })
@UseGuards(
  AuthenticateCookieGuard,
  OrganizationGuard,
  TimedDocumentAccessGuard,
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
