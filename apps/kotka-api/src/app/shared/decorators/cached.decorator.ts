import { Inject } from '@nestjs/common';
import { CachedService } from '../services/cached.service';

export function Cached(cacheKey: string, ttl: number = 10 * 60 * 1000) {
  const injectCachedService = Inject(CachedService);

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    injectCachedService(target, 'cachedService');
    const original = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cachedService = this.cachedService as CachedService;

      try {
        return cachedService.getValueWithRefresh(cacheKey, ttl, original, args);
      } catch (err) {
        console.error(err.message);
      }
    };
  };
}
