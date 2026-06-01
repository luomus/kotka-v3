/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Document, MediaTypes } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';
import { map, mergeMap, Observable } from 'rxjs';
import { Media, MediaApiService } from '@kotka/api/services';

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
          const id = getUri(data.id!);

          return this.mediaApiService.findMediaByDocumentId(id, MediaTypes.images).pipe(
            map((media: Media[]) => {
              const images = media.map(media => media.id!).sort();

              if (images) data.images = images;

              return data;
            })
          );
        })
      );
    }

    return next.handle();
  }
}
