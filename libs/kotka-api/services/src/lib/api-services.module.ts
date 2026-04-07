import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import { LajiApiService } from './laji-api.service';
import { LajiStoreService } from './laji-store.service';
import { SchemaService } from './schema.service';
import { TriplestoreService } from './triplestore.service';
import { FormService } from './form.service';
import { OldKotkaApiService } from './old-kotka-api.service';
import { AbschService } from './absch.service';
import { MediaApiService } from './media-api.service';
import { ValidationService } from './validation.service';
import { NamespaceService } from './namespace.service';
import { CacheService, REDIS, RedisModule } from '@kotka/api/redis-cache';
import Redis from 'ioredis';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [RedisModule],
      inject: [REDIS],
      useFactory: (redisClient: Redis) => {
        return {
          store: redisInsStore(redisClient)
        };
      }
    }),
    HttpModule,
    RedisModule
  ],
  controllers: [],
  providers: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    SchemaService,
    FormService,
    OldKotkaApiService,
    AbschService,
    MediaApiService,
    ValidationService,
    NamespaceService,
    CacheService
  ],
  exports: [
    LajiApiService,
    LajiStoreService,
    TriplestoreService,
    SchemaService,
    FormService,
    OldKotkaApiService,
    AbschService,
    MediaApiService,
    ValidationService,
    NamespaceService,
    CacheService
  ],
})
export class ApiServicesModule {}
