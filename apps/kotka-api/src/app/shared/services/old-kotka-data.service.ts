import { HttpStatus, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { lastValueFrom, map, switchMap } from 'rxjs';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { REDIS } from '../../shared-modules/redis/redis.constants';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class OldKotkaDataService {
  private redlock: Redlock;

  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @Inject(REDIS) private readonly redisClient: Redis
  ) {
    this.redlock = new Redlock([this.redisClient], { retryCount: 20, retryDelay: 1000 });
  };

  async getObject(type: string, id: string) {
    try {
      return await lastValueFrom(
        this.triplestoreService.get(id).pipe(
          map(data => data.data),
          switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, type)),
        )
      );
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAllObjects<T>(type: string, cacheKey: string, cacheTtl = 30 * 60 * 1000): Promise<T[]> {
    const lock = await this.redlock.acquire(['lock:' + cacheKey], cacheTtl - 1);

    try {
      const cachedData = await this.cacheService.get<T[]>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const triplestoreData = await lastValueFrom(this.triplestoreService.search({type}));
      const data = await this.triplestoreMapperService.triplestoreToJson(triplestoreData.data, type) as T[];

      await this.cacheService.set(cacheKey, data, cacheTtl);

      return data;
    } finally {
      await lock.unlock();
    }
  }
}
