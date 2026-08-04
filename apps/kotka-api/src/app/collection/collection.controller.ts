/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { AutocompleteService } from '../shared/services/autocomplete.service';
import { OldKotkaDataService } from '@kotka/api/services';

@Controller('collection')
@UseGuards(AuthenticateCookieGuard)
export class CollectionController {
  constructor(
    private readonly oldKotkaDataService: OldKotkaDataService,
    private readonly autocompleteService: AutocompleteService
  ) {}

  @Get('autocomplete')
  async getCollectionAutocomplete(@Req() req, @Query('query') query = '', @Query('limit', new DefaultValuePipe('10'), ParseIntPipe) limit = 10, @Query('onlyOwnCollections', new DefaultValuePipe('false'), ParseBoolPipe) onlyOwnCollections = false) {
    let jsonData = await this.oldKotkaDataService.getAllCollections();

    if (onlyOwnCollections) {
      const userOrgs = req.user.profile.organisation || [];

      jsonData = jsonData.filter(collection => {
        if (collection.owner && userOrgs.includes(collection.owner)) {
          return true;
        }
        return false;
      });
    }

    return this.autocompleteService.getAutocompleteResults(jsonData, 'collectionName.en', query, limit);
  }

  @Get(':id')
  async getCollection(@Param('id') id) {
    return this.oldKotkaDataService.getCollection(id);
  }

  @Get('')
  async getCollections(@Query('ids', new DefaultValuePipe([]), ParseArrayPipe) ids: string[]) {
    const jsonData = await this.oldKotkaDataService.getCollections(ids);
    return { 'member': jsonData };
  }
}
