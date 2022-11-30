/*
https://docs.nestjs.com/controllers#controllers
*/

import { StoreGetQuery } from '@kotka/api-interfaces';
import { lastValueFrom } from 'rxjs';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Body, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseInterceptors } from '@nestjs/common';
import { StoreObject } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';
import { UserInterceptor } from './interceptors/user.interceptor';
import { DateInterceptor } from './interceptors/date.interceptor';

export abstract class LajiStoreController {
  constructor (
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly type: string,
  ) {
  }
  
  @Get()
  async getAll(@Query() query: StoreGetQuery) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.getAll(this.type, query));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @UseInterceptors(UserInterceptor, DateInterceptor)
  @Post()
  async post(@Req() req, @Body() body: StoreObject) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.post(this.type, body));

      const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

      await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
    
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.get(this.type, id));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @UseInterceptors(UserInterceptor, DateInterceptor)
  @Put(':id')
  async put(@Req() req, @Param('id') id: string, @Body() body: StoreObject) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.put(this.type, id, body));

      const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

      await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
      
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


  @Delete(':id')
  @HttpCode(204)
  async del(@Param('id') id: string) {
    try {
      await lastValueFrom(this.lajiStoreService.delete(this.type, id));

      await lastValueFrom(this.triplestoreService.delete(id));

    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}