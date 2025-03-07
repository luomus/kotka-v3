/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, lastValueFrom, map } from 'rxjs';
import { Pdf, Image, Person } from '@kotka/shared/models';
import { MediaApiService } from '@kotka/api/services';

@Injectable()
export class MediaAccessInterceptor implements NestInterceptor {
  constructor (
    private readonly mediaApiService: MediaApiService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Pdf | Image>> {
    const req = context.switchToHttp().getRequest();
    const profile: Person = req.user?.profile;

    if (!profile) {
      throw new HttpException('Missing user data', HttpStatus.FORBIDDEN);
    }

    if (req.method === 'PUT') {
      const type = req.params['type'];
      const id = req.params['id'];


      if (!type) {
        throw new HttpException('Missing type parameter', HttpStatus.BAD_REQUEST);
      }

      if (!id) {
        throw new HttpException('Missing id parameter', HttpStatus.BAD_REQUEST);
      }

      const { meta } = await lastValueFrom(this.mediaApiService.getMedia(id,type));

      if (!(profile.role?.includes('MA.admin') || profile.organisation.includes(meta.rightsOwner))) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
    }

    return next
      .handle()
      .pipe(
        map((data: Pdf | Image) => {
          if (req.method !== 'GET') return data;
          if (profile.role?.includes('MA.admin')) return data;
          if (profile.organisation.includes(data.intellectualOwner)) return data;

          throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }),
      );
  }
}
