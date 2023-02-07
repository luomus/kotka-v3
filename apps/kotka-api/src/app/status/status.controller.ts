/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, BadGatewayException, Inject, InternalServerErrorException } from '@nestjs/common';
import { LajiStoreService } from '@kotka/api-services';
import { lastValueFrom, from, timeout, catchError, of } from 'rxjs';
import { REDIS } from '../shared-modules/redis/redis.constants';
import Redis from 'ioredis';

@Controller('status')
export class StatusController {
  constructor(
    @Inject(REDIS) private readonly redisClient: Redis,
    private readonly lajiStoreService: LajiStoreService,
  ) {}

  @Get()
  async status(): Promise<string> {
    const redisResponse = await lastValueFrom(from(this.redisClient.ping()).pipe(
      timeout(3000),
      catchError(() => {
        return of(null);
      })
    ));
    if (redisResponse !== 'PONG') {
      throw new InternalServerErrorException('Can\'t connect to Redis');
    }

    try {
      await lastValueFrom(this.lajiStoreService.getAll('dataset', {page: 1, page_size: 1}));
    } catch (err) {
      console.error(err);
      throw new BadGatewayException(err.message);
    }

    return 'ok';
  }
}
