/*
https://docs.nestjs.com/providers#services
*/

import { LajiApiService, LajiStoreService, AbschService } from '@kotka/api/services';
import { Dataset } from '@luomus/laji-schema';
import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ValidationService {
  constructor(
    private readonly lajiApiService: LajiApiService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly abschService: AbschService
  ) { }

  async remoteValidate(query, options) {
    let error = {};
    switch (query.validator) {
      case 'kotkaDatasetNameUnique':
        error = await this.validateDatasetNameUnique(JSON.parse(options.body), query.field);
        break;
      case 'kotkaIRCCNumber':
        error = await this.validateIRCCNumber(JSON.parse(options.body), query.field);
        break;
      default:
        try {
          await lastValueFrom(this.lajiApiService.post('documents/validate', JSON.parse(options.body), query));
        } catch (e) {
          if (e.response.status === 422) {
            error = { error: { details: e.response.data.error.details }};
          } else {
            throw e;
          }
        }
    }

    return error;
  }

  async validateDatasetNameUnique(data, field) {
    const datasetNameField = 'datasetName' + field;
    const datasetName = get(data, datasetNameField);
    const members: Dataset[] = await lastValueFrom(this.lajiStoreService.search<Dataset>('GX.dataset', { query: { match: { [datasetNameField]: datasetName }}}).pipe(map(res => res.data?.member)));

    if (members.length !== 0 && !(members.length === 1 && members[0].id && members[0].id === data.id)) {
      return this.getError(datasetNameField, "Dataset name must be unique.");
    }

    return {};
  }

  async validateIRCCNumber(data: Record<string, any>, field: string) {
    if (field[0] === '.') {
      field = field.slice(1);
    }
    const value = get(data, field);
    if (!value) {
      return;
    }

    try {
      const isValid = await this.abschService.checkIRCCNumberIsValid(value);
      if (!isValid) {
        return this.getError(field, "Invalid IRCC number \"%{value}\" given.", value);
      }
    } catch (e) {
      return this.getError(field, "ABSCH API didn't respond in time.");
    }

    return {};
  }

  private getError(field: string, errorMsg: string, value?: any) {
    return { error: { details: { [field]: [errorMsg.replace('%{value}', value)] }}};
  }
}
