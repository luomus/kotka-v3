/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { OldKotkaController } from './old-kotka.controller';
import { ApiServicesModule } from '@kotka/api/services';

@Module({
    imports: [ApiServicesModule],
    controllers: [OldKotkaController],
    providers: [],
})
export class OldKotkaModule {}
