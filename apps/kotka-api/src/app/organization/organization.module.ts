import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { RedisModule } from '../shared-modules/redis/redis.module';
import { ApiServicesModule } from '@kotka/api/services';
import { MappersModule } from '@kotka/api/mappers';

@Module({
    imports: [SharedModule, RedisModule, ApiServicesModule, MappersModule],
    controllers: [OrganizationController],
    providers: [],
})
export class OrganizationModule {}
