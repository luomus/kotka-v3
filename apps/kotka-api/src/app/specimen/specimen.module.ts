import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [ApiServicesModule],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}
