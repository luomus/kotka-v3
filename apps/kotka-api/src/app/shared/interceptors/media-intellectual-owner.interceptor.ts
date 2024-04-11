/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { LajiStoreService, MediaApiService } from '@kotka/api-services';
import { Concept, KeyOfUnion, StoreObject } from '@luomus/laji-schema/models';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, retry } from 'rxjs/operators';

const endpointTypes = ['pdf', 'image'] as const;
type MediaTarget = {[key in KeyOfUnion<StoreObject>]: 'pdf' | 'image'};
type MediaOutput = {[key in typeof endpointTypes[number]]: string[]}

@Injectable()
export class MediaIntellectualOwnerInterceptor implements NestInterceptor {
  constructor (
    private readonly mediaApiService: MediaApiService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Exclude<StoreObject, Concept>> {
    return next
      .handle()
      .pipe(
        mergeMap(doc => {
          const req = context.switchToHttp().getRequest();
          const owner = doc.owner;
          const targets: MediaTarget = this.reflector.get('intellectualOwnerMedia', context.getClass());
          const oldOwner = req.oldDoc?.owner;

          return ((oldOwner || req.method === 'POST')?
            of(req.method === 'POST' || owner !== oldOwner) :
            this.lajiStoreService.getVersionHistory(doc['@type'], doc.id, true).pipe(
              map(res => res.data),
              map(data => !!data.pop()?.patch?.filter(patch => patch.path === '/owner')?.length)
            )
          ).pipe(
            map(changeOfOwner => {
              if(!changeOfOwner) return doc;

              const media = this.findMediaValues(doc, targets);

              this.updateMediaIntellectualOwner(media, owner, doc.id);

              return doc;
            })
          );
        })
      );
  }

  updateMediaIntellectualOwner(mediaIDs: MediaOutput, owner: string, doc: string) {
    for (const key in mediaIDs) {
      const images: string[] = mediaIDs[key];

      images.forEach(image => {
        this.mediaApiService.getMedia(image, key).pipe(
          mergeMap(media => {
            const meta = media.meta;

            if (meta.rightsOwner === owner) {
              return of();
            }

            meta.rightsOwner = owner;

            return this.mediaApiService.putMetadata(image, key, meta);
          }),
          retry({ count: 5, delay: 10000, resetOnSuccess: true }),
          catchError(err => {
            console.error(`Error sending updated media metadata, document: ${doc}, media: ${image}, cause: ${err.message}`);
            return of(err);
          })
        ).subscribe();
      });

    }
  }
  findMediaValues(value: StoreObject, targets: MediaTarget): MediaOutput {
    let values: MediaOutput = { pdf: [], image: [] };
    const targetProps = Object.keys(targets);

    Object.keys(value).forEach(key => {
      if (targetProps.includes(key)) {
        return values[targets[key]].push(...(Array.isArray(value[key]) ? value[key] : [value[key]]));
      } else if (Array.isArray(value[key]) && value[key].length) {
        if (typeof value[key][0] === 'object' && value[key][0]['@type']) {
          value[key].forEach(val => values = this.mergeFound(values, this.findMediaValues(val, targets)));
        }
      } else if (typeof value[key] === 'object' && value[key]['@type']) {
        values = this.mergeFound(values, this.findMediaValues(value[key], targets));
      }
    });

    return values;
  }

  mergeFound(first: MediaOutput, second: MediaOutput) {
    const out: MediaOutput = {pdf: [], image: []};
    endpointTypes.forEach(type => out[type] = first[type].concat(second[type]));

    return out;
  }
}
