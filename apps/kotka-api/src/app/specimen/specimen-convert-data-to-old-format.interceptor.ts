/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Document } from '@luomus/laji-schema/models';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

// TODO remove after specimen schema changes
@Injectable()
export class SpecimenConvertDataToOldFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if ((req.method === 'POST' && !req.path?.endsWith('_search') ) || req.method === 'PUT') {
      const document = req.body as Document;

      if (Array.isArray(document.unreliableFields)) {
        document.unreliableFields = document.unreliableFields.join(',');
      }
      if (typeof document.gatherings?.[0]?.samplingAreaSizeInSquareMeters === 'string') {
        document.gatherings[0].samplingAreaSizeInSquareMeters =
          +document.gatherings[0].samplingAreaSizeInSquareMeters;
      }
      const units = document.gatherings?.[0]?.units || [];
      units.forEach(unit => {
        const identifications = unit.identifications || [];
        identifications.forEach((identification) => {
          if (typeof identification.preferredIdentification === 'boolean') {
            identification.preferredIdentification = identification.preferredIdentification ? 'yes' : 'no';
          }
        });
      });

      req.body = document;
      return next.handle();
    }

    return next
      .handle()
      .pipe(
        map((response) => {
          if (Array.isArray(response)) {
            return response;
          }

          const documents = response.member ? response.member : response.original ? [response.original] : [response];
          for (const document of documents) {
            if (typeof document.unreliableFields === 'string') {
              document.unreliableFields = document.unreliableFields.split(',');
            }
            if (typeof document.gatherings?.[0]?.samplingAreaSizeInSquareMeters === 'number') {
              document.gatherings[0].samplingAreaSizeInSquareMeters = document.gatherings[0].samplingAreaSizeInSquareMeters + '';
            }
            const units = document.gatherings?.[0]?.units || [];
            units.forEach(unit => {
              const identifications = unit.identifications || [];
              identifications.forEach((identification) => {
                if (typeof identification.preferredIdentification === 'string') {
                  identification.preferredIdentification = identification.preferredIdentification === 'yes';
                }
              });
            });
          }

          return response;
        })
      );
  }
}
