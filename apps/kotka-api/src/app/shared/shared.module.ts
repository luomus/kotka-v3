/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule, TriplestoreService } from '@kotka/api/services';
import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { AutocompleteService } from './services/autocomplete.service';
import { MappersModule } from '@kotka/api/mappers';
import { OldKotkaDataService } from './services/old-kotka-data.service';
import { RedisModule } from '../shared-modules/redis/redis.module';
import { CacheService } from './services/cache.service';
import { NamespaceService } from './services/namespace.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [ApiServicesModule, MappersModule, RedisModule, HttpModule],
    controllers: [],
    providers: [ValidationService, AutocompleteService, OldKotkaDataService, CacheService, TriplestoreService, NamespaceService],
    exports: [ValidationService, AutocompleteService, OldKotkaDataService, CacheService, TriplestoreService, NamespaceService]
})
export class SharedModule {}
