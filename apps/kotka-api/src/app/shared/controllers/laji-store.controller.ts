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
import { createPatch } from 'rfc6902';

export abstract class LajiStoreController<T extends StoreObject> {
  constructor (
    protected readonly lajiStoreService: LajiStoreService,
    protected readonly triplestoreService: TriplestoreService,
    protected readonly triplestoreMapperService: TriplestoreMapperService,
    protected readonly type: string,
    protected readonly useTriplestore: boolean = true
  ) {
  }

  @Get()
  async getAll(@Query() query: StoreGetQuery) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.getAll<T>(this.type, query));

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @UseInterceptors(UserInterceptor, DateInterceptor, ValidatorInterceptor)
  @Post()
  async post(@Req() req, @Body() body: T) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.post<T>(this.type, body));

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
      const res = await lastValueFrom(this.lajiStoreService.get<T>(this.type, id));

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
  async put(@Req() req, @Param('id') id: string, @Body() body: T) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.put<T>(this.type, id, body));

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

      if (this.useTriplestore) {
        await lastValueFrom(this.triplestoreService.delete(id));
      }

    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get(':id/_ver')
  async getVerHistory(@Param('id') id: string, @Query('includeDiff') includeDiff: boolean) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.getVersionHistory(this.type, id, includeDiff));

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get(':id/_ver/:ver')
  async getVer(@Param('id') id: string, @Param('ver') ver: string) {
    try {
      const res = await lastValueFrom(this.lajiStoreService.getVersion(this.type, id, ver));

      return res.data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get(':id/_ver/:ver1/diff/:ver2')
  async getVerDiff(@Param('id') id: string, @Param('ver1') ver1: string, @Param('ver2') ver2: string) {

    let firstDoc;
    let lastDoc;

    try {
      firstDoc = (await lastValueFrom(this.lajiStoreService.getVersion(this.type, id, ver1))).data;
      lastDoc = (await lastValueFrom(this.lajiStoreService.getVersion(this.type, id, ver2))).data;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }

    if (!firstDoc) {
      throw new InternalServerErrorException(`Could not find version ${ver1} for ${this.type} ${id}`);
    }

    if (!lastDoc) {
      throw new InternalServerErrorException(`Could not find version ${ver2} for ${this.type} ${id}`);
    }

    const diff = createPatch(firstDoc, lastDoc);

    return {
      original: firstDoc,
      patch: diff
    };
  }
}
