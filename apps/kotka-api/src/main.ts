/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request } from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Person } from '@kotka/shared/models';

import { AppModule } from './app/app.module';

interface UserRequest extends Request {
  user?: {
    profile: Person,
    personToken: string
  }
}

function getQueryParams(req: Request): Record<string, string> {
  const newQuery: Record<string, string> = {};
  Object.keys(req.query).forEach(key => {
    newQuery[key] = String(req.query[key]);
  });
  return newQuery;
}

function getLajiApiQueryString(req: UserRequest): string {
  const newQuery = getQueryParams(req);

  newQuery['access_token'] = process.env['LAJI_API_TOKEN'];
  if (newQuery['includePersonToken']) {
    if (newQuery['includePersonToken'] === 'true' && req.user) {
      newQuery['personToken'] = req.user.personToken;
    }
    delete newQuery['includePersonToken'];
  }

  return new URLSearchParams(newQuery).toString();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3333;

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      name: 'kotka'
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api/laji', createProxyMiddleware({
    target: process.env['LAJI_API_URL'],
    changeOrigin: true,
    pathRewrite: (path, req) => {
      let newPath = path.replace('/api/laji', '');

      const queryString = getLajiApiQueryString(req);
      newPath = `${newPath.split('?')[0]}?${queryString}`;

      return newPath;
    }
  }));

  const hostName = host !== 'localhost' ? host : undefined;
  await app.listen(port, hostName);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
