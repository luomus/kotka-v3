/*
https://docs.nestjs.com/controllers#controllers
*/

import { TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { lastValueFrom, map, switchMap } from 'rxjs';

@Controller('organization')
@UseGuards(AuthenticateCookieGuard)
export class OrganizationController {
  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService
  ) {}

  @Get(':id')
  async getOrganization(@Param('id') id) {
    try {
      return await lastValueFrom(
        this.triplestoreService.get(id).pipe(
          map(data => data.data),
          switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, 'MOS.organization')),
        )
      );
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }
}
