import { SharedModule } from './shared/shared.module';
import { MappersModule } from '@kotka/mappers';
import { AuthenticationModule } from './authentication/authentication.module';
import { Module } from '@nestjs/common';

import { ApiServicesModule } from '@kotka/api-services';
import { DatasetModule } from './dataset/dataset.module';

@Module({
  imports: [
    SharedModule, 
    MappersModule,
    AuthenticationModule,
    ApiServicesModule,
    DatasetModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
