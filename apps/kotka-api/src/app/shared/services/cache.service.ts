/*
https://docs.nestjs.com/providers#services
*/

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { REDIS } from '../../shared-modules/redis/redis.constants';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class CacheService {
  private redlock: Redlock;

  constructor (
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    @Inject(REDIS) private readonly redisClient: Redis
  ) {}

  async getValue<T>(cacheKey: string, ttl: number, getDataFunc: () => Promise<T>, forceUpdate = false): Promise<T> {
    if (!forceUpdate) {
      const cachedData = await this.cacheService.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const lock = await this.acquireLock(cacheKey, ttl);

    const data = await getDataFunc();
    await this.cacheService.set(cacheKey, data, ttl);

    await this.unlockLock(lock);

    return data;
  }

  private async acquireLock(cacheKey: string, ttl: number): Promise<Redlock.Lock|undefined> {
    if (!this.redlock) {
      this.redlock = new Redlock([this.redisClient as any], { retryCount: 10, retryDelay: 1000 });
    }
    try {
      return await this.redlock.acquire(['lock:' + cacheKey], ttl - 1);
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
