/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, DefaultValuePipe, Get, InternalServerErrorException, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService, ValidationService } from '@kotka/api/services';
import { TriplestoreMapperService } from '@kotka/api/services';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { InUseGuard } from '../shared/guards/in-use.guard';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { Dataset } from '@luomus/laji-schema';
import { KotkaObjectFullType, KotkaDocumentType } from '@kotka/shared/models';
import { lastValueFrom } from 'rxjs';

const type = KotkaObjectFullType.dataset;

@Controller(KotkaDocumentType.dataset)
@ControllerType(type)
@InUseTypesSet([KotkaObjectFullType.document, KotkaObjectFullType.organization])
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
  InUseGuard
)
export class DatasetController extends LajiStoreController<Dataset> {
  constructor(
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
      );
  }

  @Get('autocomplete')
  async getAutocomplete(
    @Query('query') query = '',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    try {
      const body = query ? {
        query: {
          bool: {
            should: [
              {
                term: {
                  id: `${query}`
                }
              },
              {
                term: {
                  'datasetName.en': {
                    value: query,
                    boost: 4
                  }
                }
              },
              {
                wildcard: {
                  'datasetName.en': {
                    value: `${query}*`,
                    boost: 2
                  }
                }
              },
              {
                wildcard: {
                  'datasetName.en': `*${query}*`
                }
              }
            ]
          }
        }
      } : {};

      const params = {sort: query ? '_score desc': 'datasetName.en', page_size: limit, fields: 'id,datasetName.en'};
      const res = await lastValueFrom(this.lajiStoreService.search<Dataset>(type, body, params));

      return res.data.member.map(data => ({
        key: data.id,
        value: data.datasetName.en
      }));
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
