/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OldKotkaController } from './old-kotka.controller';
import { ApiServicesModule } from '@kotka/api/services';
import { UtilServicesModule } from '@kotka/util-services';
import { MappersModule } from '@kotka/api/mappers';

@Module({
    imports: [ApiServicesModule, UtilServicesModule, MappersModule],
    controllers: [OldKotkaController],
    providers: [],
})
export class OldKotkaModule {}
