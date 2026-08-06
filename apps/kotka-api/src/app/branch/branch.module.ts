import { BranchController } from './branch.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api/services';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ApiServicesModule, SharedModule],
  controllers: [BranchController],
  providers: []
})
export class BranchModule {}
