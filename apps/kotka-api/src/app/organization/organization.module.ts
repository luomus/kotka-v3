import { ApiServicesModule } from '@kotka/api-services';
import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MappersModule } from '@kotka/mappers';

@Module({
    imports: [ApiServicesModule, MappersModule],
    controllers: [OrganizationController],
    providers: [],
})
export class OrganizationModule {}
