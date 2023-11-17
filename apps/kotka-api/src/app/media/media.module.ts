import { HttpModule } from '@nestjs/axios';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [ HttpModule ],
    controllers: [ MediaController ],
    providers: [ MediaService ],
})
export class MediaModule {}
