/*
https://docs.nestjs.com/providers#services
*/

import { LajiApiService, LajiStoreService } from '@kotka/api-services';
import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ValidationService {
  constructor(
    private readonly lajiApiService: LajiApiService,
    private readonly lajiStoreService: LajiStoreService,
  ) { };

  async remoteValidate(query, options) {
    let error = {};
    switch (query.validator) {
      case 'kotkaDatasetNameUnique':
        error = await this.validateDatasetNameUnique(JSON.parse(options.body), query.field);
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
    const members: Record<string, unknown>[] = await lastValueFrom(this.lajiStoreService.search('GX.dataset', { query: { match: { [datasetNameField]: datasetName }}}).pipe(map(res => res.data?.member)));

    if (members.length !== 0 && !(members.length === 1 && members[0].id === data.id)) {
      return { error: { details: { [datasetNameField]: ["Dataset name must be unique."] }}};
    }

    return {};
  }
}
