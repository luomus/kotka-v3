import { Component, Injector } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { LabelService } from '@kotka/services';
import { map } from 'rxjs/operators';
import { DatatableColumn } from '@kotka/shared/models';

@Component({
  selector: 'kui-label-cell-renderer',
  template: `
    <span title="{{ params.value | label }}">{{ params.value | label }}</span>
  `,
  styles: []
})
export class LabelCellRendererComponent extends CellRendererComponent {
  static override getExportValue(value: string, row: any, params: undefined, fetchData: Record<string, string>): string {
    if (!value) {
      return '';
    }
    return fetchData[value];
  }

  static override fetchDataNeededForExport(col: DatatableColumn, data: any[], injector: Injector): Observable<any> {
    const result: Record<string, string> = {};

    const uniqueKeys: string[] = [];
    data.forEach(item => {
      const value = item[col.field || ''];
      if (value && !uniqueKeys.includes(value)) {
        uniqueKeys.push(value);
      }
    });

    const labelService = injector.get(LabelService);

    const observables = uniqueKeys.map(key => labelService.getLabel(key).pipe(
      tap(label => {
        result[key] = label;
      })
    ));

    if (observables.length === 0) {
      return of(result);
    }

    return forkJoin(observables).pipe(map(() => result));
  }
}
