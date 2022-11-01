/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { Dataset } from '@kotka/shared/models';
import { StoreGetQuery } from '@kotka/api-interfaces';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/laji-store.controller';

@Controller('dataset')
export class DatasetController extends LajiStoreController {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
  ) {
      super(
        lajiStoreService,
        triplestoreService,
        triplestoreMapperService,
        'dataset',
        'GX.dataset');
  }
}
