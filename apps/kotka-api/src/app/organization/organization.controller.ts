/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, Req,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { OrganizationGuard } from '../shared/guards/organization.guard';
import { TimedAccessSet } from '../shared/decorators/timed-access-set.decorator';
import { TimedDocumentAccessGuard } from '../shared/guards/timed-document-access.guard';
// import { InUseGuard } from '../shared/guards/in-use.guard';
// import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { Organization } from '@luomus/laji-schema';
import { OldKotkaDataService } from '../shared/services/old-kotka-data.service';
import { AutocompleteService } from '../shared/services/autocomplete.service';
import { getOrganizationFullName } from '@kotka/utils';
import { Person } from '@kotka/shared/models';

const type = 'MOS.organization';

@Controller('organization')
@ControllerType(type)
@TimedAccessSet({ del: { 'd': 14 }})
// @InUseTypesSet(['MY.document', 'MOS.organization']) TODO
@UseGuards(
  AuthenticateCookieGuard,
  OrganizationGuard,
  TimedDocumentAccessGuard
)
export class OrganizationController extends LajiStoreController<Organization> {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    private readonly oldKotkaDataService: OldKotkaDataService,
    private readonly autocompleteService: AutocompleteService
  ) {
    super(
      lajiStoreService,
      triplestoreService,
      triplestoreMapperService,
      type,
    );
  }

  @Get('old/autocomplete')
  async getOrganizationAutocomplete(@Req() req: any, @Query('q') query = '', @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, @Query('onlyOwnOrganizations', new DefaultValuePipe(false), ParseBoolPipe) onlyOwnOrganizations: boolean) {
    const user: Person|undefined = req.user?.profile;
    const userRoles: string[] = user?.role || [];
    const userOrganizations: string[] = user?.organisation || [];

    let jsonData = await this.oldKotkaDataService.getAllOrganizations();
    if (onlyOwnOrganizations && !userRoles.includes('MA.admin')) {
      jsonData = jsonData.filter(organization => userOrganizations.includes(organization.id));
    }

    const data = jsonData.map(item => ({ ...item, fullName: getOrganizationFullName(item) }));
    return this.autocompleteService.getAutocompleteResults(data, 'fullName', query, limit);
  }

  @Get('old/:id')
  async getOrganization(@Param('id') id) {
      return this.oldKotkaDataService.getOrganization(id);
    }

  @Get('old')
  async getOrganizations(@Query('ids', new DefaultValuePipe([]), ParseArrayPipe) ids: string[]) {
    const jsonData = await this.oldKotkaDataService.getOrganizations(ids);
    return { 'member': jsonData };
  }
}
