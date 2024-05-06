/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService } from '@kotka/api-services';
import { TypeMigrationService } from '@kotka/mappers';
import { IdService } from '@kotka/util-services';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import moment from 'moment';
import { map } from 'rxjs';
import { OldKotkaGuard } from './old-kotka.guard';

@Controller()
@UseGuards(OldKotkaGuard)
export class OldKotkaController {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
    private readonly idService: IdService,
    private readonly typeMigrationService: TypeMigrationService
  ) {}

  @Get('transaction/isLoaned/:specimenId')
  getTransactionIsLoaned(@Param('specimenId') specimenId) {
    specimenId = this.idService.getIdWithoutPrefix(specimenId);
    return this.lajiStoreService.getAll('HRX.specimenTransaction', {
      q: `awayIDs:(*${specimenId})`,
      page_size: 1000,
      fields: 'id,type'
    }).pipe(
      map(res => res.data),
      map(data => data.member),
      map((transactions: SpecimenTransaction[]) => {
        let id; 
        transactions.every(transaction => {
          if (transaction.type === 'HRX.typeLoanOutgoing') {
            id = transaction.id;
            return false;
          }

          return true;
        });

        return id;
      })
    );
  }

  @Get('transaction/forSpecimen/:specimenId')
  getTransactionsForSpecimen(@Param('specimenId') specimenId) {
    specimenId = this.idService.getIdWithoutPrefix(specimenId);
    return this.lajiStoreService.getAll('HRX.specimenTransaction', {
      q: `awayIDs:(*${specimenId}) OR returnedIDs:(*${specimenId})`,
      page_size: 1000,
    }).pipe(
      map(res => res.data),
      map(data => data.member),
      map(transactions => {
        return transactions.map((transaction: SpecimenTransaction) => {
          let type;

          if (transaction.returnedIDs && transaction.returnedIDs?.findIndex(id => id.endsWith(specimenId)) !== -1) {
            type = 'returned';
          } else if (transaction.awayIDs && transaction.awayIDs?.findIndex(id => id.endsWith(specimenId)) !== -1) {
            type = 'away';
          }

          return {
            uri: this.idService.getUri(transaction.id),
            type: type,
            'HRA.transactionType': this.typeMigrationService.reverseValueMap('HRA.transaction', 'type', transaction.type),
            'HRA.transactionStatus': this.typeMigrationService.reverseValueMap('HRA.transaction', 'status', transaction.status),
            'HRA.transactionRequestReceived': transaction.requestReceived ? moment(new Date(transaction.requestReceived), 'YYYY-MM-DD') : '',
            'HRA.availableForGeneticResearch': this.typeMigrationService.reverseValueMap('HRA.transaction', 'availableForGeneticResearch', transaction.availableForGeneticResearch),
            'HRA.geneticResourceRightsAndObligations': transaction.geneticResourceRightsAndObligations
          };
        });
      }),
    );
  }
}
