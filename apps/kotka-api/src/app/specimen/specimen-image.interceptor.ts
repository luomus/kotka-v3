/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Document } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';
import { map, mergeMap, Observable } from 'rxjs';
import { MediaApiService } from '../../../../../libs/kotka-api/services/src/lib/media-api.service';
import { Meta } from '@kotka/api/services';

@Injectable()
export class SpecimenImageInterceptor implements NestInterceptor {
  constructor (
    private readonly mediaApiService: MediaApiService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (req.method === 'PUT' || (req.method === 'POST' && context.getHandler().name !== 'search')) {
      const { images, ...body} = req.body;

      if (images) req.body = body;

    } else if (req.method === 'GET' && context.getHandler().name === 'get') {
      return next.handle().pipe(
        mergeMap((data: Document) => {
          const id = getUri(data.id);

          return this.mediaApiService.findMediaByDocumentId(id, 'images').pipe(
            map((meta: Meta[]) => {
              const images = meta.map(meta => meta.id);

              if (images) data.images = images;

              return data;
            })
          )
        })
      )
    }

    return next.handle()
  }
}
