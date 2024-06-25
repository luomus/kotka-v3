/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api-services';
import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';
import { AutocompleteService } from './services/autocomplete.service';
import { MappersModule } from '@kotka/mappers';
import { OldKotkaDataService } from './services/old-kotka-data.service';
import { RedisModule } from '../shared-modules/redis/redis.module';
import { CachedService } from './services/cached.service';

@Module({
    imports: [ApiServicesModule, MappersModule, RedisModule],
    controllers: [],
    providers: [ValidationService, AutocompleteService, OldKotkaDataService, CachedService],
    exports: [ValidationService, AutocompleteService, OldKotkaDataService, CachedService]
})
export class SharedModule {}
