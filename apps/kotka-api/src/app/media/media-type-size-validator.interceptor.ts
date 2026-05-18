/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnsupportedMediaTypeException, PayloadTooLargeException, UnprocessableEntityException } from '@nestjs/common';
import { MediaTypes } from '@kotka/shared/models';
import { Observable } from 'rxjs';

@Injectable()
export class MediaTypeSizeValidatorInterceptor implements NestInterceptor {
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
    images: 350,
    pdf: 350
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const type: MediaTypes = req.params['type'];
    const file: Express.Multer.File = req.file;

    if (type !== 'pdf' && type !== 'images') {
      throw new UnprocessableEntityException(`Unsupported type ${type}, supported type parameters are pdf or images.`);
    }

    if (!this.acceptedTypes[type]?.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(`File ${file.originalname} is of unaccepted type, accepted types are: ${this.acceptedTypes[type].map(imgType => imgType?.replace('image/', '').replace('application/', '')).join(', ')}.`);
    } else if (this.acceptedSizes[type] !== undefined && file.size > this.acceptedSizes[type] * 1024**2) {
      throw new PayloadTooLargeException(`File ${file.originalname} is larger that allowed, max size ${this.acceptedSizes[type]}MB`);
    }

    return next.handle();
  }
}
