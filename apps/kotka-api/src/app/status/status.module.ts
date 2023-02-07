import { StatusController } from './status.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';
import { RedisModule } from '../shared-modules/redis/redis.module';

@Module({
  imports: [ApiServicesModule, RedisModule],
  controllers: [StatusController],
  providers: []
})
export class StatusModule {}
