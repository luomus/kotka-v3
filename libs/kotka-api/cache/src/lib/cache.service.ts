/*
https://docs.nestjs.com/providers#services
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import Redlock from 'redlock';
import { DUAL, REDIS } from './redis.constants';
import { Cacheable, PerStoreTtl } from 'cacheable';

export interface MultiSetEntry<T> {
  [key: string]: T;
}

@Injectable()
export class CacheService {
  private redlock: Redlock;

  constructor (
    @Inject(DUAL) private readonly cacheService: Cacheable,
    @Inject(REDIS) private readonly redisClient: Redis
  ) {}

  async setValue<T>(
    cacheKey: string,
    getDataFunc: () => Promise<any>,
    ttl: string | number | PerStoreTtl,
    isMultiSet = false,
  ) {

    const lock = await this.acquireLock(cacheKey);
    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const data = await getDataFunc();

      if (isMultiSet) {
        const lookupCacheArray = [];

        for (const key of Object.keys(data as MultiSetEntry<T>)) {
          lookupCacheArray.push({key: `${cacheKey}_${key}`, value: data[key], ttl: ttl as PerStoreTtl });
        }

        const res = await this.cacheService.setMany(lookupCacheArray);
      } else {
        await this.cacheService.set(cacheKey, data, { ttl });
      }

      return data;
    } finally {
      await this.unlockLock(lock);
    }
  }

  async getLookupValue<T>(cacheKeyRoot: string, cacheKey: string, ttl: string | number | PerStoreTtl, getDataFunc: () => Promise<{ [key: string]: T }>, forceUpdate = false): Promise<T | undefined> {
    if (!forceUpdate) {
      const cachedData = await this.cacheService.get<T>(`${cacheKeyRoot}_${cacheKey}`);

      if (cachedData) {
        return cachedData;
      }
    }

    const data = await this.setValue<T>(cacheKeyRoot, getDataFunc, ttl, true);

    return data[cacheKey];
  }

  async getValue<T>(cacheKey: string, ttl: string | number | PerStoreTtl, getDataFunc: () => Promise<T>, forceUpdate = false): Promise<T> {
    if (!forceUpdate) {
      const cachedData = await this.cacheService.get<T>(cacheKey);

      if (cachedData) {
        return cachedData;
      }
    }

    return await this.setValue<T>(cacheKey, getDataFunc, ttl);
  }

  private async acquireLock(cacheKey: string): Promise<Redlock.Lock|undefined> {
    if (!this.redlock) {
      this.redlock = new Redlock([this.redisClient as any], { retryCount: 10, retryDelay: 1000 });
    }
    try {
      return await this.redlock.acquire(['lock:' + cacheKey], 10 * 60 * 1000);
    } catch (err) {
      console.warn(err);
    }
  }

  private async unlockLock(lock?: Redlock.Lock): Promise<void> {
    if (lock) {
      await lock.unlock();
    }
  }
}
