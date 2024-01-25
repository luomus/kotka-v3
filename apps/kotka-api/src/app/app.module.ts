import { OrganizationModule } from './organization/organization.module';
import { ValidateModule } from './validate/validate.module';
import { SharedModule } from './shared/shared.module';
import { MappersModule } from '@kotka/mappers';
import { AuthenticationModule } from './authentication/authentication.module';
import { Module } from '@nestjs/common';

import { ApiServicesModule } from '@kotka/api-services';
import { DatasetModule } from './dataset/dataset.module';
import { StatusModule } from './status/status.module';
import { RedisModule } from './shared-modules/redis/redis.module';
import { SpecimenModule } from './specimen/specimen.module';
import { TransactionModule } from './transaction/transaction.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    RedisModule,
    ValidateModule,
    SharedModule,
    MappersModule,
    AuthenticationModule,
    ApiServicesModule,
    DatasetModule,
    StatusModule,
    SpecimenModule,
    TransactionModule,
    MediaModule,
    OrganizationModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
