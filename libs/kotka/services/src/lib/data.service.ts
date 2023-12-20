import { Injectable } from '@angular/core';
import {
  KotkaDocumentObjectType,
  KotkaDocumentObject,
  KotkaVersionDifferenceObject,
  ListResponse,
  StoreVersion,
  KotkaVersionDifference,
  StorePatch
} from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get, set } from 'lodash';
import { ApiClient } from '@kotka/services';


@Injectable({
  providedIn: 'root'
})

export class DataService {
  constructor(
    private apiClient: ApiClient
  ) {}

  getById(type: KotkaDocumentObjectType, id: string): Observable<KotkaDocumentObject> {
    return this.apiClient.getDocumentById(type, id);
  }

  create(type: KotkaDocumentObjectType, data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    return this.apiClient.createDocument(type, data);
  }

  update(type: KotkaDocumentObjectType, id: string, data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    return this.apiClient.updateDocument(type, id, data);
  }

  delete(type: KotkaDocumentObjectType, id: string): Observable<null> {
    return this.apiClient.deleteDocument(type, id);
  }

  getData(type: KotkaDocumentObjectType, page=1, pageSize=100, sort?: string, searchQuery?: string): Observable<ListResponse<KotkaDocumentObject>> {
    return this.apiClient.getDocumentList(type, page, pageSize, sort, searchQuery);
  }

  getVersionList(type: KotkaDocumentObjectType, id: string): Observable<StoreVersion[]> {
    return this.apiClient.getDocumentVersionList(type, id);
  }

  getVersionData(type: KotkaDocumentObjectType, id: string, version: number): Observable<KotkaDocumentObject> {
    return this.apiClient.getDocumentVersionData(type, id, version);
  }

  getVersionDifference(type: KotkaDocumentObjectType, id: string, version1: number, version2: number): Observable<KotkaVersionDifferenceObject> {
    return this.apiClient.getDocumentVersionDifference(type, id, version1, version2).pipe(
      map(data => this.convertVersionDifferenceFormat(data))
    );
  }

  private convertVersionDifferenceFormat(data: KotkaVersionDifference): KotkaVersionDifferenceObject {
    const diff = {};
    const isRemovedFromArray: Record<string, boolean[]> = {};

    const getIdxBeforeArrayRemovals = (idx: number, arrayPath: string[], patch: StorePatch): number => {
      const arrayPathString = arrayPath.join('/');

      if (!isRemovedFromArray[arrayPathString]) {
        isRemovedFromArray[arrayPathString] = [];
      }

      const isRemoved = isRemovedFromArray[arrayPathString];

      for (let i = 0; i < isRemoved.length && i <= idx; i++) {
        if (isRemoved[i]) {
          idx++;
        }
      }

      if (patch.op === "remove") {
        isRemoved[idx] = true;
      }

      return idx;
    };

    const parsePatchPath = (patch: StorePatch): string[] => {
      const path = patch.path.split('/').filter(value => !!value);

      const parentPath = path.slice(0, -1);
      const parentValue = get(data.original, parentPath);

      let lastPathPart = path[path.length - 1];

      if (lastPathPart === '-') {
        const originalArray = parentValue || [];
        const diffArray = get(diff, parentPath) || [];
        lastPathPart = Math.max(originalArray.length, diffArray.length).toString();
      } else if (Array.isArray(parentValue)) {
        let arrayIdx = parseInt(lastPathPart, 10);
        arrayIdx = getIdxBeforeArrayRemovals(arrayIdx, parentPath, patch);
        lastPathPart = arrayIdx.toString();
      }

      path[path.length - 1] = lastPathPart;

      return path;
    };


    data.patch.forEach(patch => {
      const path = parsePatchPath(patch);
      set(diff, path, { op: patch.op, value: patch.value });
    });

    return {
      original: data.original,
      diff
    };
  }
}
