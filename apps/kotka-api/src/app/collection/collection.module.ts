import { CollectionController } from './collection.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { RedisModule } from '../shared-modules/redis/redis.module';

@Module({
  imports: [SharedModule, RedisModule],
  controllers: [CollectionController],
  providers: [],
})
export class CollectionModule {}
