import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ApiLabelService } from './api-label.service';

export type LabelKey = string | number | boolean;

@Injectable({
  providedIn: 'root'
})

export class LabelService {
  constructor(
    private apiLabelService: ApiLabelService,
    private datePipe: DatePipe
  ) {}

  getLabel(key: LabelKey): Observable<string> {
    const apiLabelType = this.apiLabelService.getApiLabelType(key);
    if (apiLabelType) {
      return this.apiLabelService.getLabel(key as string, apiLabelType);
    } else {
      return of(this.getSimpleLabel(key));
    }
  }

  getMultipleLabelsWithSameType(keys: LabelKey[]): Observable<Record<string, string>> {
    const apiLabelType = this.apiLabelService.getApiLabelType(keys);
    if (apiLabelType) {
      return this.apiLabelService.getLabels(keys as string[], apiLabelType);
    } else {
      return of(keys.reduce((result, key) => {
        result[key + ''] = this.getSimpleLabel(key);
        return result;
      }, {} as Record<string, string>));
    }
  }

  private getSimpleLabel(key: LabelKey): string {
    if (key == null || typeof key === 'number') {
      return key + '';
    }

    if (typeof key === 'boolean') {
      return key ? 'Yes' : 'No';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      return this.datePipe.transform(key, 'dd.MM.YYYY') || key;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(key)) {
      return this.datePipe.transform(key, 'dd.MM.YYYY HH:mm') || key;
    }

    return key;
  }
}
