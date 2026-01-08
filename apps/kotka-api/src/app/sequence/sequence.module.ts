import { SequenceController } from './sequence.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [ApiServicesModule],
  controllers: [SequenceController],
  providers: [],
})
export class SequenceModule {}
