import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import Redlock from 'redlock';
import { REDIS } from '../../shared-modules/redis/redis.constants';

export function Cached(cacheKey: string, ttl: number = 10 * 60 * 1000) {
  const injectCacheService = Inject(CACHE_MANAGER);
  const injectRedisClientService = Inject(REDIS);

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    injectCacheService(target, 'cacheService');
    injectRedisClientService(target, 'redisClient');

    let redlock: Redlock;
    const original = descriptor.value;

    descriptor.value = async function(...args: any[]) {
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

      if (!redlock) {
        redlock = new Redlock([this.redisClient]);
      }

      let lock: Redlock.Lock;
      try {
        lock = await redlock.acquire(['lock:' + cacheKey], ttl - 1);
      } catch (e) {
        return getResult();
      }

      try {
        return getResult();
      } finally {
        await lock.unlock();
      }
    };
  };
}
