/*
https://docs.nestjs.com/controllers#controllers
*/

import { LajiStoreService, OldKotkaApiService, TriplestoreService, ValidationService } from '@kotka/api/services';
import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  Query,
  Post,
  Body,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { KotkaObjectFullType, KotkaDocumentType } from '@kotka/shared/models';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { TriplestoreMapperService } from '@kotka/api/services';
import { SpecimenIdJoinerInterceptor } from './interceptors/specimen-id-joiner.interceptor';
import { SpecimenConvertDataToOldFormatInterceptor } from './interceptors/specimen-convert-data-to-old-format.interceptor';
import { SpecimenImageInterceptor } from './interceptors/specimen-image.interceptor';
import { CoordinateMatchInterceptor } from './interceptors/coordinate-match.interceptor';
import { ClearUncertainFieldOrphansInterceptor } from './interceptors/clear-uncertain-field-orphans.interceptor';
import { AssociatedTaxaToUnitInterceptor } from './interceptors/associated-taxa-to-unit.interceptor';
import { CollectionAccessibleToUserInterceptor } from './interceptors/collection-accessible-to-user.interceptor';
import { SpecimenIndexerInterceptor } from './interceptors/specimen-search-indexer.interceptor';
import { IndexTypes, SpecimenSearchService } from '@kotka/api/specimen-search';

const type = KotkaObjectFullType.document;

@Controller(KotkaDocumentType.specimen)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
@UseInterceptors(
  ClearUncertainFieldOrphansInterceptor,
  CoordinateMatchInterceptor,
  AssociatedTaxaToUnitInterceptor,
  CollectionAccessibleToUserInterceptor,
  SpecimenConvertDataToOldFormatInterceptor,
  SpecimenIdJoinerInterceptor,
  SpecimenIndexerInterceptor,
  SpecimenImageInterceptor,
)

export class SpecimenController extends LajiStoreController<Document> {
  constructor(
    private readonly oldKotkaApiService: OldKotkaApiService,
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly validationService: ValidationService,
    protected readonly specimenSearchService: SpecimenSearchService
  ) {
    super(
      lajiStoreService,
      triplestoreService,
      triplestoreMapperService,
      validationService,
      type,
      false
    );
  }

  @Get('range/:range')
  async getRange(@Param('range') range: string) {
    return await lastValueFrom(this.oldKotkaApiService.getRange(range));
  }

  @Get(':type/fields')
  async getFields(@Param('type') type: IndexTypes) {
    return await this.specimenSearchService.getIndexedFields(type);
  }

  @Get('autocomplete')
  async getAutocomplete(
    @Query('field') field: string,
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return await this.specimenSearchService.getAutocompleteSuggestions(field, query, limit);
  }

  @Post(':type/_search')
  async esSearch(
    @Param('type') type: IndexTypes,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('page_size', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('q') query?: string,
    @Query('sort') sort?: string,
    @Query('fields') fields?: string,
    @Body() body?: any
  ) {
    return await this.specimenSearchService.getSearchResults(type, query, pageSize, page, sort, fields, body);
  }
}
