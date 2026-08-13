import { Module } from '@nestjs/common';
import { DUAL, KEYV, REDIS } from './redis.constants';
import { RedisHealthIndicator } from './redis.health';
import { createKeyv, Keyv } from '@keyv/redis';
import { Cacheable, KeyvCacheableMemory } from 'cacheable';
import { Redis } from 'ioredis';
import { CacheService } from './cache.service';

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => {
        return new Redis({
          host: process.env['REDIS_HOST'],
          password: process.env['REDIS_PASSWORD']
        });
      }
    },
    {
      provide: KEYV,
      useFactory: () => {
        return createKeyv({
          url: `redis://${process.env['REDIS_HOST']}`,
          password: process.env['REDIS_PASSWORD'],
        });
      }
    },
    {
      provide: DUAL,
      inject: [KEYV],
      useFactory: (keyvClient: Keyv) => {
        return new Cacheable({
          primary: new KeyvCacheableMemory({lruSize: 1000, maxTtl: '1h'}),
          secondary: keyvClient,
          maxTtl: '24h'
        });
      }
    },
    RedisHealthIndicator,
    CacheService
  ],
  exports: [REDIS, DUAL, RedisHealthIndicator, CacheService],
})
export class CacheModule {}
