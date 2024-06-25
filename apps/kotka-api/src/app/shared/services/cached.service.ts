/*
https://docs.nestjs.com/providers#services
*/

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from '../../shared-modules/redis/redis.constants';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class CachedService {
  constructor (
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(REDIS) private readonly redisClient: Redis
  ) {}
  
  redlock: Redlock;

  async getValueWithRefresh(cacheKey, ttl, original, args) {
    const getResult = async () => {
      const cacheService: Cache = this.cacheService;

      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const result = await original.apply(this, args);
      await cacheService.set(cacheKey, result, ttl);
      return result;
    };

    if (!this.redlock) {
      this.redlock = new Redlock([this.redisClient as any]);
    }

    let lock: Redlock.Lock;
    try {
      lock = await this.redlock.acquire(['lock:' + cacheKey], ttl - 1);
    } catch (err) {
      console.warn(err);
      return getResult();
    }

    try {
      return getResult();
    } finally {
      await lock.unlock();
    }
  }

  async setValue(cacheKey, value, ttl) {
    if (!this.redlock) {
      this.redlock = new Redlock([this.redisClient as any]);
    }

    let lock: Redlock.Lock;
    try {
      lock = await this.redlock.acquire(['lock:' + cacheKey], ttl - 1);
    } catch (err) {
      console.warn(err);
      return this.cacheService.set(cacheKey, value, ttl);
    }

    try {
      return this.cacheService.set(cacheKey, value, ttl);
    } finally {
      await lock.unlock();
    }
  }
}
