import { ApiServicesModule } from '@kotka/api-services';
import { Module } from '@nestjs/common';
import { TriplestoreMapperService } from './triplestore-mapper.service';

@Module({
  imports: [ApiServicesModule],
  controllers: [],
  providers: [TriplestoreMapperService],
  exports: [TriplestoreMapperService],
})
export class MappersModule {}
