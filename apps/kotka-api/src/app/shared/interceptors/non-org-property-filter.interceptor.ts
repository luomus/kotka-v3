/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { allowAccessByOrganization } from '@kotka/utils';
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { KotkaVersionDifference, StoreObject, StorePatch, StoreVersion } from '@kotka/shared/models';
import { StoreQueryResult } from '@kotka/api-interfaces';

@Injectable()
export class NonOrgPropertyFilterInterceptor<T extends StoreObject | StoreVersion[] | KotkaVersionDifference> implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector
  ){ }


  intercept(context: ExecutionContext, next: CallHandler): Observable<Partial<T>> {
    return next
      .handle()
      .pipe(
        map((data: T) => {
          const req = context.switchToHttp().getRequest();
          if (req.method !== 'GET') return data;

          const filters: string[] = this.reflector.get('nonOrgFilteredProperties', context.getClass());
          if (!filters) return data;

          if (req.user.profile.role?.includes('MA.admin')) return data;

          let newData;
          switch (context.getHandler().name) {
            case 'getAll':
              newData = { ...(data as StoreQueryResult<StoreObject>), member: (data as StoreQueryResult<StoreObject>).member.map(member => this.cloneStoreObjectWithOmit(member, filters))};
              break;
            case 'get':
            case 'getVer':
              newData = allowAccessByOrganization(data as StoreObject, req.user.profile)
                ? data
                : this.cloneStoreObjectWithOmit(data as StoreObject, filters);
              break;
            case 'getVerHistory':
              newData = (data as StoreVersion[]).map(data => (data.patch ? {...data, patch: this.clonePatchWithOmit(data.patch, filters)} : data));
              break;
            case 'getVerDiff':
              newData = allowAccessByOrganization((data as KotkaVersionDifference).original, req.user.profile) 
                ? data
                : { original: this.cloneStoreObjectWithOmit((data as KotkaVersionDifference).original, filters), patch: this.clonePatchWithOmit((data as KotkaVersionDifference).patch, filters)};
              break;
            default:
              newData = data;
          }

          return newData;
        })
      );


  }

  clonePatchWithOmit(patches: StorePatch[], filters: string[]) {
    patches = patches.filter(patch => !filters.some((filter => patch.path.endsWith(filter))));

    return patches.map(patch => {
      if (Array.isArray(patch.value)) {
        if (patch.value.length && patch.value[0]['@type']) {
          return { ...patch, value: patch.value.map(val => this.cloneStoreObjectWithOmit(val, filters)) };
        } else {
          return patch;
        }
      } else if (typeof patch.value === 'object' && patch.value['@type']) {
        return { ...patch, value: this.cloneStoreObjectWithOmit(patch.value, filters) };
      } else {
        return patch;
      }
    });
  }

  cloneStoreObjectWithOmit(value: StoreObject, filters: string[]): Partial<StoreObject> {
    const newObject = {};

    Object.keys(value).forEach(key => {
      if (filters.includes(key)) {
        return;
      } else if (Array.isArray(value[key]) && value[key].length) {
        if (typeof value[key][0] === 'object' && value[key][0]['@type']) {
          newObject[key] = value[key].map(val => this.cloneStoreObjectWithOmit(val, filters));
        } else {
          newObject[key] = value[key];
        }
      } else if (typeof value[key] === 'object' && value[key]['@type']) {
        newObject[key] = this.cloneStoreObjectWithOmit(value[key], filters);
      } else {
        newObject[key] = value[key];
      }
    });

    return newObject;
  }
}
