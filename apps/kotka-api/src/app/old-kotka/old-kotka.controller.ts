/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService } from '@kotka/api/services';
import { TypeMigrationService } from '@kotka/api/mappers';
import { IdService } from '@kotka/util-services';
import { Dataset, Organization, SpecimenTransaction } from '@luomus/laji-schema';
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

  @Get('tagsSelect')
  getTagsSelect() {
    return this.lajiStoreService.getAll<Dataset>('dataset', { fields: 'id,datasetName.en', sort: 'datasetName.en', page_size: 5000 }).pipe(
      map(res => res.data),
      map(data => data.member),
      map(datasets => {
        const selectMap = {};
        datasets.forEach(dataset => {
          selectMap[dataset.id] = dataset.datasetName.en;
        });
        return selectMap;
      })
    );
  }

  @Get('organizationsSelect')
  getOrganizationSelect() {
    return this.lajiStoreService.getAll<Organization>('organization', { fields: 'id,abbreviation,fullName.en', sort: 'fullName.en', page_size: 10000 }).pipe(
      map(res => res.data),
      map(data => data.member),
      map(organizations => {
        const selectMap = {};
        const abbreviated = [];
        const unabbreviated = [];

        organizations.forEach(organization => {
          if (organization.abbreviation) {
            abbreviated.push(organization);
          } else {
            unabbreviated.push(organization);
          }
        });

        abbreviated.push(...unabbreviated);

        abbreviated.forEach(organization => {
          selectMap[organization.id] = organization.fullName.en;
        });

        return selectMap;
      }),
    );
  }

  @Get('transaction/isLoaned/:specimenId')
  getTransactionIsLoaned(@Param('specimenId') specimenId) {
    const specimenIdQname = this.idService.getUri(specimenId);
    const specimenIdPrefix = this.idService.getId(specimenIdQname);
    specimenId = this.idService.getIdWithoutPrefix(specimenIdPrefix);

    return this.lajiStoreService.getAll('HRX.specimenTransaction', {
      q: `awayIDs:("${specimenIdQname}", "${specimenIdPrefix}", "${specimenId}")`,
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
    const specimenIdQname = this.idService.getUri(specimenId);
    const specimenIdPrefix = this.idService.getId(specimenIdQname);
    specimenId = this.idService.getIdWithoutPrefix(specimenIdPrefix);

    return this.lajiStoreService.getAll('HRX.specimenTransaction', {
      q: `awayIDs:("${specimenIdQname}", "${specimenIdPrefix}", "${specimenId}") OR returnedIDs:("${specimenIdQname}", "${specimenIdPrefix}", "${specimenId}")`,
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
