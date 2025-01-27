/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, DefaultValuePipe, Get, InternalServerErrorException, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { InUseGuard } from '../shared/guards/in-use.guard';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { Dataset } from '@luomus/laji-schema';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType } from '@kotka/shared/models';
import { lastValueFrom } from 'rxjs';

const type = KotkaDocumentObjectFullType.dataset;
const useTriplestore = false;

@Controller(KotkaDocumentObjectType.dataset)
@ControllerType(type)
@InUseTypesSet([KotkaDocumentObjectFullType.document, KotkaDocumentObjectFullType.organization])
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
  ) {
      super(
        lajiStoreService,
        triplestoreService,
        triplestoreMapperService,
        type,
        useTriplestore
      );
  }

  @Get('autocomplete')
  async getAutocomplete(
    @Query('q') q = '',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    try {
      const body = q ? {
        query: {
          bool: {
            should: [
              {
                term: {
                  id: `${q}`
                }
              },
              {
                term: {
                  'datasetName.en': q
                }
              },
              {
                wildcard: {
                  'datasetName.en': `*${q}*`
                }
              }
            ]
          }
        }
      } : {};

      const params = {sort: q ? '_score desc': 'datasetName.en', page_size: limit, fields: 'id,datasetName.en'};
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
