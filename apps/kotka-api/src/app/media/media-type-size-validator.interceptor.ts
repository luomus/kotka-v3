/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnsupportedMediaTypeException, PayloadTooLargeException } from '@nestjs/common';
import { Observable } from 'rxjs';
//@ts-ignore
import { Multer } from 'multer';

@Injectable()
export class MediaTypeValidatorInterceptor implements NestInterceptor {
  acceptedTypes = {
    'pdf': [
      'application/pdf'
    ],
    'images': [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/tiff'
    ]
  };

  acceptedSizes = {
    image: 350 * 1024**2,
    pdf: 350 * 1024**2
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const type = req.params['type'];
    const files: Express.Multer.File[] = req.files;

    files.forEach(file => {
      if (!this.acceptedTypes[type]?.includes(file.mimetype)) {
        throw new UnsupportedMediaTypeException(`File ${file.originalname} is of unaccepted type.`);
      } else if (this.acceptedSizes[type] !== undefined && file.size > this.acceptedSizes[type]) {
        throw new PayloadTooLargeException(`File ${file.originalname} is larger that allowed, max size ${this.acceptedSizes[type]}MB`);
      }
    });
    return next.handle();
  }
}
