import { DatasetController } from './dataset.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';

@Module({
  imports: [ApiServicesModule],
  controllers: [DatasetController],
  providers: []
})
export class DatasetModule {}
