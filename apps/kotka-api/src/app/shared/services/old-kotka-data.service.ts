import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TriplestoreService } from '@kotka/api/services';
import { TriplestoreMapperService } from '@kotka/api/mappers';
import { Collection } from '@luomus/laji-schema';
import { lastValueFrom, map, switchMap } from 'rxjs';
import { Cached } from '../decorators/cached.decorator';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { CacheService } from './cache.service';

const collectionType = 'MY.collection';
const cache_ttl = 12 * 60 * 60 * 1000; // 12 h
@Injectable()
export class OldKotkaDataService {

  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService,
    private readonly cacheService: CacheService,
  ) {}

  async getCollection(id: string) {
    return this.getObject<Collection>(collectionType, id);
  }

  async getCollections(ids: string[]) {
    return this.getObjects<Collection>(collectionType, ids);
  }

  @Cached('allCollections', cache_ttl)
  async getAllCollections() {
    return this.getAllObjects<Collection>(collectionType);
  }

  @Timeout(0)
  async initializeAll() {
    await this.updateAll();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateAll() {
    await this.updateCollections();
  }

  private async updateCollections() {
    const getDataFunc = async () => await this.getAllObjects<Collection>(collectionType);
    await this.cacheService.getValue('allCollections', cache_ttl, getDataFunc, true);
  }

  private async getObject<T>(type: string, id: string) {
    try {
      return await lastValueFrom(
        this.triplestoreService.get(id).pipe(
          map(data => data.data),
          switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, type)),
        )
      ) as T;
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  private async getObjects<T>(type: string, ids: string[]) {
    try {
      return await lastValueFrom(
        this.triplestoreService.search({type, subject: ids.join(',')}).pipe(
          map(data => data.data),
          switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, type)),
          map(data => Array.isArray(data) ? data : [data])
        )
      ) as T[];
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        return [];
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  private async getAllObjects<T>(type: string): Promise<T[]> {
    try {
      const objects: T[] = [];
      const getPage = async (current: number) => {
        const triplestoreData = await lastValueFrom(this.triplestoreService.search({ type }, { limit: 3000, offset: current * 3000 }));
        return await this.triplestoreMapperService.triplestoreToJson(triplestoreData.data, type) as T[];
      };

      const paginatedIterator = this.getAllPaginatedIterator(getPage);
      for await (const page of paginatedIterator) {
        objects.push(...page);
      }

      return objects;
    } catch (err) {
      if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
        return [];
      }

      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  private getAllPaginatedIterator<T>(fun: (current: number) => Promise<T[]>) {
    return {
      [Symbol.asyncIterator]() {
        let current = 0;
        const last = 100;
        return {
          async next() {
            //Allegedly might help with ECONNRESET error, otherwise does nothing
            await new Promise(resolve => setTimeout(resolve, 0));
            const data = await fun(current);
            current++;

            if (this.current === last || !data.length) {
              return { done: true };
            } else {
              return { done: false, value: data };
            }
          },
        };
      }
    };
  }
}
