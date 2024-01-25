/*
https://docs.nestjs.com/controllers#controllers
*/

import { TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { map, switchMap } from 'rxjs';

@Controller('organization')
@UseGuards(AuthenticateCookieGuard)
export class OrganizationController {
  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService
  ) {}

  @Get(':id')
  getOrganization(@Param('id') id) {
    return this.triplestoreService.get(id).pipe(
      map(data => data.data),
      switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, 'MOS.organization')),
    );
  }
}
