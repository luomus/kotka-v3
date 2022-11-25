import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LajiApiService } from '@kotka/api-services';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { lastValueFrom } from 'rxjs';

const path = 'autocomplete/';

@Controller('autocomplete')
export class AutocompleteController {
  constructor(
    private readonly lajiApiSevice: LajiApiService
  ) {}

  @UseGuards(AuthenticateCookieGuard)
  @Get(':field')
  async get(@Param('field') field: string, @Query() query: any, @Req() request: Request) {
    try {
      query = {...query, personToken: request['user'].personToken};
      const res = await lastValueFrom(this.lajiApiSevice.get(`${path}/${field}`, query));
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
