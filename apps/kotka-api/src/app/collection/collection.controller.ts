/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  Param, ParseArrayPipe, ParseIntPipe, Query,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { Collection } from '@luomus/laji-schema';
import { AutocompleteService } from '../shared/services/autocomplete.service';
import { OldKotkaDataService } from '../shared/services/old-kotka-data.service';

@Controller('collection')
@UseGuards(AuthenticateCookieGuard)
export class CollectionController {
  constructor(
    private readonly oldKotkaDataService: OldKotkaDataService,
    private readonly autocompleteService: AutocompleteService
  ) {}

  @Get('autocomplete')
  async getCollectionAutocomplete(@Query('q') query = '', @Query('limit', new DefaultValuePipe('10'), ParseIntPipe) limit = 10) {
    const jsonData = await this.oldKotkaDataService.getAllObjects<Collection>('MY.collection', 'allCollections');
    return this.autocompleteService.getAutocompleteResults(jsonData, 'collectionName.en', query, limit);
  }

  @Get(':id')
  async getCollection(@Param('id') id) {
    return this.oldKotkaDataService.getObject('MY.collection', id);
  }

  @Get('')
  async getCollections(@Query('ids', new DefaultValuePipe([]), ParseArrayPipe) ids: string[]) {
    const jsonData = await this.oldKotkaDataService.getObjects('MY.collection', ids);
    return { 'member': jsonData };
  }
}
