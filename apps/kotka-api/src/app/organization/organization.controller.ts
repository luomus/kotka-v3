/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, Req,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { Organization } from '@luomus/laji-schema';
import { OldKotkaDataService } from '../shared/services/old-kotka-data.service';
import { AutocompleteService } from '../shared/services/autocomplete.service';
import { getOrganizationFullName } from '@kotka/utils';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType, Person } from '@kotka/shared/models';
import { lastValueFrom } from 'rxjs';
import { set } from 'lodash';

const type = KotkaDocumentObjectFullType.organization;
const useTriplestore = false;

@Controller(KotkaDocumentObjectType.organization)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
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
      useTriplestore
    );
  }

  @Get('autocomplete')
  async getAutocomplete(
    @Req() req: any,
    @Query('q') q = '',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('onlyOwnOrganizations', new DefaultValuePipe(false),
    ParseBoolPipe) onlyOwnOrganizations: boolean
  ) {
     try {
      const user: Person|undefined = req.user?.profile;
      const userRoles: string[] = user?.role || [];
      const userOrganizations: string[] = user?.organisation || [];

      const body = q ? {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: q,
                  operator: 'and',
                  fields: [
                    "id^6",
                    "abbreviation^5",
                    "organizationLevel4.en.autocomplete^4",
                    "organizationLevel3.en.autocomplete^3",
                    "organizationLevel2.en.autocomplete^2",
                    "organizationLevel1.en.autocomplete"
                  ]
                }
              } as Record<string, any>
            ]
          }
        }
      } : {};

      if (onlyOwnOrganizations && !userRoles.includes('MA.admin')) {
        const terms = {
          "terms": {
            "owner": userOrganizations
          }
        };

        if (!q) {
          set(body, ['query', 'bool', 'must'], [terms]);
        } else {
          body.query.bool.must.push(terms);
        }
      }

      const params = {sort: q ? '_score desc': 'abbreviation,organizationLevel4.en,organizationLevel3.en,organizationLevel2.en,organizationLevel1.en', limit, fields: 'id,abbreviation,organizationLevel1.en,organizationLevel2.en,organizationLevel3.en,organizationLevel4.en'};
      const res = await lastValueFrom(this.lajiStoreService.search<Organization>(type, body, params));

      return res.data.member.map(data => ({
        key: data.id,
        value: getOrganizationFullName(data)
      }));
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
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
