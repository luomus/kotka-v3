import { ValidateModule } from './validate/validate.module';
import { SharedModule } from './shared/shared.module';
import { MappersModule } from '@kotka/mappers';
import { AuthenticationModule } from './authentication/authentication.module';
import { Module, NestModule, MiddlewareConsumer, Inject } from '@nestjs/common';

import { ApiServicesModule } from '@kotka/api-services';
import { DatasetModule } from './dataset/dataset.module';
import { StatusModule } from './status/status.module';
import session from 'express-session';
import passport from 'passport';
import { RedisModule } from './shared-modules/redis/redis.module';
import { REDIS } from './shared-modules/redis/redis.constants';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';

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
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  constructor(@Inject(REDIS) private readonly redisClient: Redis) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = connectRedis(session);

    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redisClient,
            ttl: 14 * 24 * 3600
          }),
          secret: process.env.SESSION_SECRET,
          resave: false,
          saveUninitialized: false,
          name: 'kotka',
          cookie: {
            sameSite: true,
            secure: process.env['SECURE_COOKIE'] === 'true',
            maxAge: 14 * 24 * 3600 * 1000
          }
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
