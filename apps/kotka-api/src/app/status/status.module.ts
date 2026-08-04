import { StatusController } from './status.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@kotka/api/cache';

@Module({
  imports: [TerminusModule, CacheModule],
  controllers: [StatusController],
  providers: []
})
export class StatusModule {}
