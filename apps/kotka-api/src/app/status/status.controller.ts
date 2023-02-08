/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from '../shared-modules/redis/redis.health';

@Controller('status')
export class StatusController {
  constructor(
    private health: HealthCheckService,
    private redisHealthIndicator: RedisHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async status() {
    return this.health.check([
      () => this.redisHealthIndicator.isHealthy('redis'),
      () => this.http.pingCheck('lajistore', process.env['LAJI_STORE_URL'] + 'ping'),
    ]);
  }
}
