/*
https://docs.nestjs.com/controllers#controllers
*/

import { StoreGetQuery } from '@kotka/api-interfaces';
import { lastValueFrom } from 'rxjs';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Body, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { StoreObject } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';

export abstract class LajiStoreController {
  constructor (
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly type: string,
    protected readonly triplestoreType: string
  ) {
  }
  
  @UseGuards(AuthenticateCookieGuard)
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


  @UseGuards(AuthenticateCookieGuard)
  @Post()
  async post(@Req() req, @Body() body: StoreObject) {
    try {
      const user = req.user.profile.id;
      const date = new Date().toISOString();

      body['creator'] = user;
      body['editor'] = user;
      body['dateCreated'] = date;
      body['dateEdited'] = date;

      const res = await lastValueFrom(this.lajiStoreService.post(this.type, body));

      const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.triplestoreType);

      await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
    
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @UseGuards(AuthenticateCookieGuard)
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

  @UseGuards(AuthenticateCookieGuard)
  @Put(':id')
  async put(@Req() req, @Param('id') id: string, @Body() body: StoreObject) {
    try {
      const user = req.user.profile.id;
      const date = new Date().toISOString();

      body['editor'] = user;
      body['dateEdited'] = date;

      const res = await lastValueFrom(this.lajiStoreService.put(this.type, id, body));

      const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.triplestoreType);

      await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
      
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
  @UseGuards(AuthenticateCookieGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.delete(this.type, id));

      await lastValueFrom(this.triplestoreService.delete(id));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  */
}