import { Module } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS } from './redis.constants';

@Module({
  providers: [
    {
      provide: REDIS,
      useValue: new Redis({
        host: 'redis',
        password: process.env['REDIS_PASSWORD']
      }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
