import { HttpModule } from '@nestjs/axios';
import { MediaController } from './media.controller';
import { MediaApiService } from '@kotka/api-services';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [ HttpModule ],
    controllers: [ MediaController ],
    providers: [ MediaApiService ],
})
export class MediaModule {}
