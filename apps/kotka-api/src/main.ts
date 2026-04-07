import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app/app.module';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';
import { REDIS } from '@kotka/api/redis-cache';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisClient = app.get<Redis>(REDIS);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3333;

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
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
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const hostName = host !== 'localhost' ? host : undefined;
  await app.listen(port, hostName);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
