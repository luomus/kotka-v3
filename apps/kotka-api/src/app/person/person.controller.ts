import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LajiApiService } from '@kotka/api-services';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { lastValueFrom } from 'rxjs';

const path = 'person/';

@Controller('person')
export class PersonController {
  constructor(
    private readonly lajiApiSevice: LajiApiService
  ) {}

  @UseGuards(AuthenticateCookieGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const res = await lastValueFrom(this.lajiApiSevice.get(`${path}/by-id/${id}`));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
