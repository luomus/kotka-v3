/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  InternalServerErrorException,
  Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, Req,
  UseGuards,
  UseInterceptors
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
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType, Person } from '@kotka/shared/models';
import { lastValueFrom } from 'rxjs';
import { set } from 'lodash';
import { OrganizationFullNameInterceptor } from './organization-fullname.interceptor';

const type = KotkaDocumentObjectFullType.organization;
const useTriplestore = false;

@Controller(KotkaDocumentObjectType.organization)
@ControllerType(type)
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
)
@UseInterceptors(OrganizationFullNameInterceptor)
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
            should: [
              {
                term: {
                  id: q
                }
              },
              {
                term: {
                  'fullName.en': q
                }
              },
              {
                wildcard: {
                  'fullName.en': `*${q}*`
                }
              }
            ],
          }
        }
      } : {};

      if (onlyOwnOrganizations && !userRoles.includes('MA.admin')) {
        const terms = {
          terms: {
            owner: userOrganizations
          }
        };

        set(body, ['query', 'bool', 'must'], [terms]);
      }

      const params = {sort: q ? '_score desc': 'fullName.en', limit, fields: 'id,fullName.en'};
      const res = await lastValueFrom(this.lajiStoreService.search<Organization>(type, body, params));

      return res.data.member.map(data => ({
        key: data.id,
        value: data.fullName.en
      }));
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
