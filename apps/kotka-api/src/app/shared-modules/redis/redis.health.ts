import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { catchError, from, lastValueFrom, of, timeout } from 'rxjs';
import { REDIS } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(REDIS) private readonly redisClient: Redis
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const redisResponse = await lastValueFrom(from(this.redisClient.ping()).pipe(
      timeout(3000),
      catchError(() => {
        return of(null);
      })
    ));
    if (redisResponse === 'PONG') {
      return this.getStatus(key, true);
    }

    throw new HealthCheckError("Redis connection failed", this.getStatus(key, false));
  }
}
