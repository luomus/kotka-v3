/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller, DefaultValuePipe,
  Get,
  InternalServerErrorException,
  ParseBoolPipe, ParseIntPipe, Query, Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService, TriplestoreService } from '@kotka/api/services';
import { TriplestoreMapperService } from '@kotka/api/mappers';
import { LajiStoreController } from '../shared/controllers/laji-store.controller';
import { ControllerType } from '../shared/decorators/controller-type.decorator';
import { ApiMethodAccessGuard } from '../shared/guards/api-method-access.guard';
import { Organization } from '@luomus/laji-schema';
import { KotkaDocumentObjectFullType, KotkaDocumentObjectType, Person } from '@kotka/shared/models';
import { lastValueFrom } from 'rxjs';
import { set } from 'lodash';
import { OrganizationFullNameInterceptor } from './organization-fullname.interceptor';
import { InUseTypesSet } from '../shared/decorators/in-use-types-set.decorator';
import { InUseGuard } from '../shared/guards/in-use.guard';

const type = KotkaDocumentObjectFullType.organization;

@Controller(KotkaDocumentObjectType.organization)
@ControllerType(type)
@InUseTypesSet([
  KotkaDocumentObjectFullType.document,
  KotkaDocumentObjectFullType.organization,
  KotkaDocumentObjectFullType.transaction,
  KotkaDocumentObjectFullType.dataset,
  KotkaDocumentObjectFullType.document,
  KotkaDocumentObjectFullType.sample
])
@UseGuards(
  AuthenticateCookieGuard,
  ApiMethodAccessGuard,
  InUseGuard,
)
@UseInterceptors(OrganizationFullNameInterceptor)
export class OrganizationController extends LajiStoreController<Organization> {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService
  ) {
    super(
      lajiStoreService,
      triplestoreService,
      triplestoreMapperService,
      type,
    );
  }

  @Get('autocomplete')
  async getAutocomplete(
    @Req() req: any,
    @Query('query') query = '',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('onlyOwnOrganizations', new DefaultValuePipe(false),
    ParseBoolPipe) onlyOwnOrganizations: boolean
  ) {
    try {
      const user: Person|undefined = req.user?.profile;
      const userRoles: string[] = user?.role || [];
      const userOrganizations: string[] = user?.organisation || [];

      const body: Record<string, any> = {};
      const should = query ? {
        bool: {
          should: [
            {
              term: {
                id: query
              }
            },
            {
              term: {
                'fullName.en': {
                  value: query,
                  boost: 4
                }
              }
            },
            {
              wildcard: {
                'fullName.en': {
                  value: `${query}*`,
                  boost: 2
                }
              }
            },
            {
              wildcard: {
                'fullName.en': `*${query}*`
              }
            }
          ],
        }
      } : undefined;

      if (onlyOwnOrganizations && !userRoles.includes('MA.admin')) {
        const terms = {
          terms: {
            id: userOrganizations
          }
        };

        set(body, ['query', 'bool', 'must'], [terms]);
        if (query) body.query.bool.must.push(should);
      } else if (query) {
        set(body, ['query'], should);
      }

      const params = {sort: query ? '_score desc': 'fullName.en', limit, fields: 'id,fullName.en'};
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
