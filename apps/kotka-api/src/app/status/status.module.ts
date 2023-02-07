import { StatusController } from './status.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';

@Module({
  imports: [ApiServicesModule],
  controllers: [StatusController],
  providers: []
})
export class StatusModule {}
