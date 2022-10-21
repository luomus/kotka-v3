/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService } from '@kotka/api-services';
import { Dataset } from '@kotka/shared/models';

@Controller('dataset')
export class DatasetController {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
  ) {}

  private readonly type = 'dataset'

  @UseGuards(AuthenticateCookieGuard)
  @Get() 
  async getAll() {
    try {
    const res = await lastValueFrom(this.lajiStoreService.getAll(this.type));

    return res.data;
    } catch (err) {
      console.log(err)
    }
  }

  @UseGuards(AuthenticateCookieGuard)
  @Post()
  async post(@Body() body: Dataset) {
    const res = await lastValueFrom(this.lajiStoreService.post(this.type, body));

    return res.data;
  }

  @UseGuards(AuthenticateCookieGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    const res = await lastValueFrom(this.lajiStoreService.get(this.type, id));

    return res.data;
  }

  @UseGuards(AuthenticateCookieGuard)
  @Put(':id')
  async put(@Param('id') id: string, @Body() body: Dataset) {
    const res = await lastValueFrom(this.lajiStoreService.put(this.type, id, body));

    return res.data;
  }

  @UseGuards(AuthenticateCookieGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const res = await lastValueFrom(this.lajiStoreService.delete(this.type, id));

    return res.data;
  }
}
