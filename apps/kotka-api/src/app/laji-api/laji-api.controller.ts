import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';
import { Request, Response } from 'express';
import { ErrorMessages, Person } from '@kotka/shared/models';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';

interface UserRequest extends Request {
  user?: {
    profile: Person,
    personToken: string
  }
}

@Controller('laji')
@UseGuards(AuthenticateCookieGuard)
export class LajiApiController {
  private readonly lajiApiBase = '/api/laji';
  private readonly lajiApiProxy: RequestHandler;

  constructor(
    private authService: AuthenticationService
  ) {
    this.lajiApiProxy = this.getLajiApiProxy();
  }

  @Get(['forms{*all}', 'person{*all}', 'areas{*all}'])
  proxyGetRequest(@Req() req: Request, @Res() res: Response) {
    void this.lajiApiProxy(req, res);
  }

  @Post(['logger{*all}', 'html-to-pdf{*all}'])
  proxyPostRequest(@Req() req: Request, @Res() res: Response) {
    void this.lajiApiProxy(req, res);
  }

  private getLajiApiProxy() {
    return createProxyMiddleware({
      target: process.env['LAJI_API_URL'],
      changeOrigin: true,
      selfHandleResponse: true,
      pathRewrite: this.pathRewrite.bind(this),
      on: {
        proxyRes: this.proxyRes.bind(this)
      }
    });
  }

  private proxyRes(proxyRes: Request, req: UserRequest, res: Response) {
    if (req.path === '/html-to-pdf') {
      this.forwardAllHeaders(proxyRes, res);
      res.status(proxyRes.statusCode);

      proxyRes.on('data', (chunk) => {
        res.write(chunk);
      });

      proxyRes.on('end', async () => {
        res.end();
      });
    } else {
      const data = [];
      proxyRes.on('data', (chunk) => {
        data.push(chunk);
      });

      proxyRes.on('end', async () => {
        const body = Buffer.concat(data);
        if (proxyRes.statusCode === 400 && body.toString().includes('INVALID TOKEN')) {
          this.authService.invalidateSession(req);
          res.status(401).json({ message: ErrorMessages.loginRequired, error: 'Unauthorized', statusCode: 401 });
        } else {
          this.forwardAllHeaders(proxyRes, res);
          res.status(proxyRes.statusCode).send(body);
        }

        res.end();
      });
    }
  }

  private pathRewrite(path: string, req: UserRequest): string {
    let newPath = path.replace(this.lajiApiBase, '');

    const queryString = this.getLajiApiQueryString(req);
    newPath = `${newPath.split('?')[0]}?${queryString}`;

    return newPath;
  }

  private getLajiApiQueryString(req: UserRequest): string {
    const newQuery = this.getQueryParams(req);

    newQuery['access_token'] = process.env['LAJI_API_TOKEN'];
    if (newQuery['includePersonToken']) {
      if (newQuery['includePersonToken'] === 'true') {
        newQuery['personToken'] = req.user.personToken;
      }
      delete newQuery['includePersonToken'];
    }

    return new URLSearchParams(newQuery).toString();
  }

  private getQueryParams(req: Request): Record<string, string> {
    const newQuery: Record<string, string> = {};
    Object.keys(req.query).forEach(key => {
      newQuery[key] = String(req.query[key]);
    });
    return newQuery;
  }

  private forwardAllHeaders(proxyRes: Request, res: Response) {
    Object.keys(proxyRes.headers).forEach((key) => {
      res.append(key, proxyRes.headers[key]);
    });
  }
}
