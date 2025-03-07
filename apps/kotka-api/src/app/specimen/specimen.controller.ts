/*
https://docs.nestjs.com/controllers#controllers
*/

import { OldKotkaApiService } from '@kotka/api/services';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';

@Controller('specimen')
@UseGuards(
  AuthenticateCookieGuard,
)
export class SpecimenController {
  constructor (
    private readonly oldKotkaApiService: OldKotkaApiService
  ) {}

  @Get('range/:range')
  async getRange(@Param('range') range: string) {
    return await lastValueFrom(this.oldKotkaApiService.getRange(range));
  }
}
