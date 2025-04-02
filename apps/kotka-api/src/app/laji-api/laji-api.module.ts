import { LajiApiController } from './laji-api.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [AuthenticationModule],
  controllers: [LajiApiController],
  providers: []
})
export class LajiApiModule {}
