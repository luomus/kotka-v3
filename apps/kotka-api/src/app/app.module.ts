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
import { CollectionModule } from './collection/collection.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import { REDIS } from './shared-modules/redis/redis.constants';
import Redis from 'ioredis';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [RedisModule],
      inject: [REDIS],
      useFactory: (redisClient: Redis) => {
        return {
          store: redisInsStore(redisClient)
        };
      }
    }),
    ScheduleModule.forRoot(),
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
    OrganizationModule,
    CollectionModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
