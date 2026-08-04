import { CollectionController } from './collection.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { CacheModule } from '@kotka/api/cache';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [SharedModule, CacheModule, ApiServicesModule],
  controllers: [CollectionController],
  providers: [],
})
export class CollectionModule {}
