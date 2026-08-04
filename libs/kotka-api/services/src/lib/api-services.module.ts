import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LajiApiService } from './laji-api.service';
import { LajiStoreService } from './laji-store.service';
import { TriplestoreService } from './triplestore.service';
import { FormService } from './form.service';
import { OldKotkaApiService } from './old-kotka-api.service';
import { AbschService } from './absch.service';
import { MediaApiService } from './media-api.service';
import { ValidationService } from './validation.service';
import { NamespaceService } from './namespace.service';
import { OldKotkaDataService } from './old-kotka-data.service';
import { TypeMigrationService } from './type-migration.service';
import { TriplestoreMapperService } from './triplestore-mapper.service';
import { CacheService, CacheModule } from '@kotka/api/cache';

@Module({
  imports: [
    HttpModule,
    CacheModule,
  ],
  controllers: [],
  providers: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    FormService,
    OldKotkaApiService,
    AbschService,
    MediaApiService,
    ValidationService,
    NamespaceService,
    OldKotkaDataService,
    TypeMigrationService,
    TriplestoreMapperService,
    CacheService
  ],
  exports: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    FormService,
    OldKotkaApiService,
    AbschService,
    MediaApiService,
    ValidationService,
    NamespaceService,
    OldKotkaDataService,
    TypeMigrationService,
    TriplestoreMapperService,
  ],
})
export class ApiServicesModule {}
