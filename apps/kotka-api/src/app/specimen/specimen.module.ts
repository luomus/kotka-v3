import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api/services';
import { SharedModule } from '../shared/shared.module';
import { MappersModule } from '@kotka/api/mappers';

@Module({
  imports: [SharedModule, ApiServicesModule, MappersModule],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}
