import { TransactionController } from './transaction.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api/services';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [ApiServicesModule, SharedModule],
  controllers: [TransactionController],
  providers: []
})
export class TransactionModule {}
