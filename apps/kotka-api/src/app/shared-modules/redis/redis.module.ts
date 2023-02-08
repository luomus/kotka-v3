import { Module } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from './redis.constants';
import { RedisHealthIndicator } from './redis.health';

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: new Redis({
        host: 'redis',
        password: process.env['REDIS_PASSWORD']
      }),
    },
    RedisHealthIndicator
  ],
  exports: [REDIS, RedisHealthIndicator],
})
export class RedisModule {}
