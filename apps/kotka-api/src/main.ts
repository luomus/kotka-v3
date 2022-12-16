import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app/app.module';
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import { AuthenticationService } from './app/authentication/authentication.service';
import { Person } from '@kotka/shared/models';

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
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3333;

  const RedisStore = connectRedis(session);
  const redisClient = new Redis({
    host: 'redis',
    password: process.env['REDIS_PASSWORD']
  });

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
  const allowedPaths = ['/autocomplete', '/forms', '/organization', '/person'];

  const proxyFilter = (pathname: string, req: Request) => {
    const path = pathname.replace(lajiApiBase, '');
    const isAllowedPath = allowedPaths.some(allowedPath => path.startsWith(allowedPath));
    return isAllowedPath && req.method === 'GET';
  };

  const proxyServer = createProxyMiddleware(proxyFilter, {
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

  app.use(lajiApiBase, proxyServer);

  const hostName = host !== 'localhost' ? host : undefined;
  await app.listen(port, hostName);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
