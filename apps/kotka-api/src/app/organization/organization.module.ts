import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [OrganizationController],
    providers: [],
})
export class OrganizationModule {}
