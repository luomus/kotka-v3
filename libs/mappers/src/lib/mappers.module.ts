import { ApiServicesModule } from '@kotka/api-services';
import { Module } from '@nestjs/common';
import { TriplestoreMapperService } from './triplestore-mapper.service';
import { TypeMigrationService } from './type-migration.service';

@Module({
  imports: [ApiServicesModule],
  controllers: [],
  providers: [TriplestoreMapperService, TypeMigrationService],
  exports: [TriplestoreMapperService, TypeMigrationService],
})
export class MappersModule {}
