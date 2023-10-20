import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app/app.module';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import { AuthenticationService } from './app/authentication/authentication.service';
import { Person } from '@kotka/shared/models';
import { REDIS } from './app/shared-modules/redis/redis.constants';

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
  const authService = app.get<AuthenticationService>(AuthenticationService);
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

  const lajiApiBase = '/api/laji';
  const allowedGetPaths = ['/autocomplete', '/forms', '/organization', '/person', '/areas'];
  const allowedPostPaths = ['/logger'];

  const externalProxyFilter = (pathname: string, req: UserRequest) => {
    const path = pathname.replace(lajiApiBase, '');
    if (req.method === 'GET') {
      return allowedGetPaths.some(allowedPath => path.startsWith(allowedPath));
    } else if (req.method === 'POST') {
      return allowedPostPaths.some(allowedPath => path.startsWith(allowedPath));
    }

    return false;
  };

  const externalProxyServer = createProxyMiddleware(externalProxyFilter, {
    target: process.env['LAJI_API_URL'],
    changeOrigin: true,
    pathRewrite: (path: string, req: UserRequest) => {
      let newPath = path.replace(lajiApiBase, '');

      const queryString = getLajiApiQueryString(req);
      newPath = `${newPath.split('?')[0]}?${queryString}`;

      return newPath;
    },
    onProxyRes: (proxyRes, req: UserRequest, res) => {
      const data = [];
      proxyRes.on('data', (chunk) => {
        data.push(chunk);
      });

      proxyRes.on('end', async () => {
        if (proxyRes.statusCode === 401 || (proxyRes.statusCode === 400 && Buffer.concat(data).toString().includes('INVALID TOKEN'))) {
          authService.invalidateSession(req);
        }
      });
    },
  });

  app.use(lajiApiBase, externalProxyServer);

  const hostName = host !== 'localhost' ? host : undefined;
  await app.listen(port, hostName);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
