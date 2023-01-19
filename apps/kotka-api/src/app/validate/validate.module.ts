import { ValidateController } from './validate.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ValidateController],
  providers: []
})
export class ValidateModule {}
