import { Component, Injector } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { Observable, of } from 'rxjs';
import { LabelKey, LabelService } from '@kotka/services';
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

  static override fetchDataNeededForExport(col: DatatableColumn, data: any[], injector: Injector): Observable<Record<string, string>> {
    const uniqueKeys: LabelKey[] = [];
    data.forEach(item => {
      const value = item[col.field || ''];
      if (value != null && !uniqueKeys.includes(value)) {
        uniqueKeys.push(value);
      }
    });

    if (uniqueKeys.length === 0) {
      return of({});
    }

    const labelService = injector.get(LabelService);
    return labelService.getMultipleLabelsWithSameType(uniqueKeys);
  }
}
