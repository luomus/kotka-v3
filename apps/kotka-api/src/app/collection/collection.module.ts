import { CollectionController } from './collection.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CollectionController],
  providers: [],
})
export class CollectionModule {}
