/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ControllerType } from './decorators/controller-type.decorator';
import { InUseTypesSet } from './decorators/in-use-types-set.decorator';
import { TimedAccessSet } from './decorators/timed-access-set.decorator';

@Module({
    imports: [],
    controllers: [],
    providers: [],
    exports: []
})
export class SharedModule {}
