import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { MappersModule } from '@kotka/api/mappers';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [ApiServicesModule, SharedModule, MappersModule],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}
