import { DatasetController } from './dataset.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ApiServicesModule, MappersModule, SharedModule],
  controllers: [DatasetController],
  providers: []
})
export class DatasetModule {}
