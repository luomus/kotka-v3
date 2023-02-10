import { StatusController } from './status.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '../shared-modules/redis/redis.module';

@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [StatusController],
  providers: []
})
export class StatusModule {}
