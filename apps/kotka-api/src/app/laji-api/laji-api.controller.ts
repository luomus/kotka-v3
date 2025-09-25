import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { createProxyMiddleware, RequestHandler, fixRequestBody } from 'http-proxy-middleware';
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
        proxyReq: fixRequestBody,
        proxyRes: this.proxyRes.bind(this)
      }
    });
  }

  private proxyRes(proxyRes: Request, req: UserRequest, res: Response) {
    // check if responses with status code 400 contain the person token expired error message, process other responses normally
    if (
      req.path !== '/forms/MHL.1158' && // TODO remove after specimen schema changes
      proxyRes.statusCode !== 400
    ) {
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
        let body = Buffer.concat(data);
        if (body.toString().includes('INVALID TOKEN')) {
          this.authService.invalidateSession(req);
          res.status(401).json({ message: ErrorMessages.loginRequired, error: 'Unauthorized', statusCode: 401 });
        } else {
          this.forwardAllHeaders(proxyRes, res);
          body = this.patchSpecimenForm(req.path, body);
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

  // TODO remove after specimen schema changes
  private patchSpecimenForm(path: string, body: any) {
    const findFieldIdx = (fields: {name: string}[], field: string) => {
      return fields.findIndex(f => f.name === field);
    };

    if (path === '/forms/MHL.1158') {
      const jsonString = body.toString();
      if (!jsonString) {
        return body;
      }

      const data = JSON.parse(jsonString);

      if (data.schema) {
        data.schema.properties.unreliableFields = {
          ...data.schema.properties.unreliableFields,
          'type': 'array',
          'items': {
            'type': 'string'
          }
        };
        data.schema.properties.gatherings.items.properties.samplingAreaSizeInSquareMeters = {
          ...data.schema.properties.gatherings.items.properties.samplingAreaSizeInSquareMeters,
          'type': 'string'
        };

        data.schema.properties.gatherings.items.properties.units.items.properties.identifications.items.properties.preferredIdentification = {
          ...data.schema.properties.gatherings.items.properties.units.items.properties.identifications.items.properties.preferredIdentification,
          'type': 'boolean'
        };
      } else if (data.fields) {
        const unreliableFieldsIdx = findFieldIdx(data.fields, 'unreliableFields');
        const gatheringsIdx = findFieldIdx(data.fields, 'gatherings');
        const samplingAreaSizeInSquareMetersIdx = findFieldIdx(data.fields[gatheringsIdx].fields, 'samplingAreaSizeInSquareMeters');
        const unitsIdx = findFieldIdx(data.fields[gatheringsIdx].fields, 'units');
        const identificationsIdx = findFieldIdx(data.fields[gatheringsIdx].fields[unitsIdx].fields, 'identifications');
        const preferredIdentificationIdx = findFieldIdx(data.fields[gatheringsIdx].fields[unitsIdx].fields[identificationsIdx].fields, 'preferredIdentification');

        data.fields[unreliableFieldsIdx] = {
          ...data.fields[unreliableFieldsIdx],
          'type': 'collection',
          'options': {
            'target_element': {
              'type': 'text'
            }
          }
        };

        data.fields[gatheringsIdx].fields[samplingAreaSizeInSquareMetersIdx] = {
          ...data.fields[gatheringsIdx].fields[samplingAreaSizeInSquareMetersIdx],
          'type': 'text'
        };

        data.fields[gatheringsIdx].fields[unitsIdx].fields[identificationsIdx].fields[preferredIdentificationIdx] = {
          ...data.fields[gatheringsIdx].fields[unitsIdx].fields[identificationsIdx].fields[preferredIdentificationIdx],
          'type': 'checkbox'
        };
      }

      return Buffer.from(JSON.stringify(data));
    }

    return body;
  }
}
