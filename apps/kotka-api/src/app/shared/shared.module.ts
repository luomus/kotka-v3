/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { Module } from '@nestjs/common';
import { AutocompleteService } from './services/autocomplete.service';

@Module({
    imports: [ApiServicesModule],
    controllers: [],
    providers: [AutocompleteService],
    exports: [AutocompleteService]
})
export class SharedModule {}
