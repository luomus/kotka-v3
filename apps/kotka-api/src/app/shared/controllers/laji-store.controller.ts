/*
https://docs.nestjs.com/controllers#controllers
*/

import { StoreGetQuery } from '@kotka/api-interfaces';
import { lastValueFrom } from 'rxjs';
import { LajiStoreService, TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors
} from '@nestjs/common';
import { StoreObject } from '@kotka/shared/models';
import { cloneDeep } from 'lodash';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { DateInterceptor } from '../interceptors/date.interceptor';
import { ValidatorInterceptor } from '../interceptors/validator.interceptor';

export abstract class LajiStoreController {
  constructor (
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly type: string,
    protected readonly useTriplestore: boolean = true,
  ) {
  }

  @Get()
  async getAll(@Query() query: StoreGetQuery) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.getAll(this.type, query));

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @UseInterceptors(UserInterceptor, DateInterceptor, ValidatorInterceptor)
  @Post()
  async post(@Req() req, @Body() body: StoreObject) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.post(this.type, body));

      if (this.useTriplestore) {
        try {
        const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

        await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
        } catch (err) {
          await lastValueFrom(this.lajiStoreService.delete(this.type, res.data.id));
          throw err;
        }
      }

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.get(this.type, id));

      return res.data;
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @UseInterceptors(UserInterceptor, DateInterceptor, ValidatorInterceptor)
  @Put(':id')
  async put(@Req() req, @Param('id') id: string, @Body() body: StoreObject) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.put(this.type, id, body));

      if (this.useTriplestore) {
        const rdfXml = await this.triplestoreMapperService.jsonToTriplestore(cloneDeep(res.data), this.type);

        await lastValueFrom(this.triplestoreService.put(res.data.id, rdfXml));
      }

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
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
      throw new InternalServerErrorException(err.message);
    }
  }
}
