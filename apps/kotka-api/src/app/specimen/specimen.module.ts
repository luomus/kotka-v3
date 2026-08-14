import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/
import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ApiServicesModule } from '@kotka/api/services';
import { ElasticModule } from '@kotka/api/elasticsearch';
import { SpecimenSearchModule } from '@kotka/api/specimen-search';

@Module({
  imports: [ApiServicesModule, SharedModule, ElasticModule, SpecimenSearchModule],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}
