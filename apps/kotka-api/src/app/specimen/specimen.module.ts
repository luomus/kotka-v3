import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/
import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
  imports: [ApiServicesModule, SharedModule],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}
