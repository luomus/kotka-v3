/*
https://docs.nestjs.com/controllers#controllers
*/

import { StoreGetQuery } from '@kotka/api-interfaces';
import { lastValueFrom } from 'rxjs';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Body, Delete, Get, HttpCode, Param, Post, Put, Query, Req } from '@nestjs/common';
import { StoreObject } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';

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

  @Post()
  async post(@Req() req, @Body() body: StoreObject) {
    try {
      const user = req.user.profile.id;
      const date = new Date().toISOString();

      body['creator'] = user;
      body['editor'] = user;
      body['dateCreated'] = date;
      body['dateEdited'] = date;

      //const res = await lastValueFrom(this.lajiStoreService.post(this.type.split('.')[1], body));

      //const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

      //await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
    
      return body;//res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.get(this.type.split('.')[1], id));

      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  @Put(':id')
  async put(@Req() req, @Param('id') id: string, @Body() body: StoreObject) {
    try {
      const user = req.user.profile.id;
      const date = new Date().toISOString();

      body['editor'] = user;
      body['dateEdited'] = date;

      //const res = await lastValueFrom(this.lajiStoreService.put(this.type.split('.')[1], id, body));

      //const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

      //await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
      
      return body;//res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }


  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    try {
      //await lastValueFrom(this.lajiStoreService.delete(this.type, id));

      //await lastValueFrom(this.triplestoreService.delete(id));

      return 'DELETED';
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}