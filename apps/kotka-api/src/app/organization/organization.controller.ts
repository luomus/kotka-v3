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
import { Organization } from '@luomus/laji-schema';
import { OldKotkaDataService } from '../shared/services/old-kotka-data.service';
import { AutocompleteService } from '../shared/services/autocomplete.service';
import { getOrganizationFullName } from '@kotka/utils';

@Controller('organization')
@UseGuards(AuthenticateCookieGuard)
export class OrganizationController {
  constructor(
    private readonly oldKotkaDataService: OldKotkaDataService,
    private readonly autocompleteService: AutocompleteService
  ) {}

  @Get('autocomplete')
  async getOrganizationAutocomplete(@Query('q') query = '', @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10) {
    const jsonData = await this.oldKotkaDataService.getAllObjects<Organization>('MOS.organization', 'allOrganizations');
    const data = jsonData.map(item => ({ ...item, fullName: getOrganizationFullName(item) }));
    return this.autocompleteService.getAutocompleteResults(data, 'fullName', query, limit);
  }

  @Get(':id')
  async getOrganization(@Param('id') id) {
    return this.oldKotkaDataService.getObject('MOS.organization', id);
  }

  @Get('')
  async getOrganizations(@Query('ids', new DefaultValuePipe([]), ParseArrayPipe) ids: string[]) {
    const jsonData = await this.oldKotkaDataService.getObjects('MOS.organization', ids);
    return { 'member': jsonData };
  }
}
