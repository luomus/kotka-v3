/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api-services';
import { Module } from '@nestjs/common';
import { ValidationService } from './services/validation.service';

@Module({
    imports: [ApiServicesModule],
    controllers: [],
    providers: [ValidationService],
    exports: [ValidationService]
})
export class SharedModule {}
