import { HttpModule } from '@nestjs/axios';
import { MediaController } from './media.controller';
import { MediaApiService, LajiStoreService } from '@kotka/api/services';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [ HttpModule ],
    controllers: [ MediaController ],
    providers: [ MediaApiService, LajiStoreService ],
})
export class MediaModule {}
