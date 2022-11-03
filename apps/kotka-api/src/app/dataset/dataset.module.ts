import { DatasetController } from './dataset.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';

@Module({
  imports: [ApiServicesModule, MappersModule],
  controllers: [DatasetController],
  providers: []
})
export class DatasetModule {}
