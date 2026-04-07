import { ValidateController } from './validate.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [SharedModule, ApiServicesModule],
  controllers: [ValidateController],
  providers: []
})
export class ValidateModule {}
