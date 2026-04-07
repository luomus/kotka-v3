/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { Module } from '@nestjs/common';
import { AutocompleteService } from './services/autocomplete.service';
import { MappersModule } from '@kotka/api/mappers';
import { OldKotkaDataService } from './services/old-kotka-data.service';

@Module({
    imports: [ApiServicesModule, MappersModule],
    controllers: [],
    providers: [AutocompleteService, OldKotkaDataService],
    exports: [AutocompleteService, OldKotkaDataService]
})
export class SharedModule {}
