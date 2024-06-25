import { Inject } from '@nestjs/common';
import { CacheService } from '../services/cache.service';

export function Cached(cacheKey: string, ttl: number = 10 * 60 * 1000) {
  const injectCacheService = Inject(CacheService);

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    injectCacheService(target, 'cacheService');
    const original = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheService = this.cacheService as CacheService;

      const getDataFunc = async () => await original.apply(this, args);

      try {
        return cacheService.getValue(cacheKey, ttl, getDataFunc);
      } catch (err) {
        console.error(err.message);
      }
    };
  };
}
