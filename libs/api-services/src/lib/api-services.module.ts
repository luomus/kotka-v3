import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LajiApiService } from './laji-api.service';
import { LajiStoreService } from './laji-store.service';
import { SchemaService } from './schema.service';
import { TriplestoreService } from './triplestore.service';
import { FormService } from './form.service';
import { OldKotkaApiService } from './old-kotka-api.service';

@Module({
  imports: [
    HttpModule
  ],
  controllers: [],
  providers: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    SchemaService,
    FormService,
    OldKotkaApiService
  ],
  exports: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    SchemaService,
    FormService,
    OldKotkaApiService
  ],
})
export class ApiServicesModule {}
