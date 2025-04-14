import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { Observable, of } from 'rxjs';
import { LabelKey, LabelService } from '@kotka/ui/services';
import { ColDef } from '../models/models';
import { JoinPipe, LabelPipe } from '@kotka/ui/pipes';

@Component({
  selector: 'kui-label-cell-renderer',
  template: `
    <span title="{{ params.value | label | join }}">{{
      params.value | label: 'Loading...' | join
    }}</span>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LabelPipe, JoinPipe],
})
export class LabelCellRendererComponent extends CellRendererComponent {
  static override getExportValue(
    value: string,
    row: any,
    params: undefined,
    fetchData: Record<string, string>,
  ): string {
    if (value == null) {
      return '';
    } else if (Array.isArray(value)) {
      return value
        .map((val) =>
          LabelCellRendererComponent.getExportValue(
            val,
            row,
            params,
            fetchData,
          ),
        )
        .join(', ');
    }
    return fetchData[value];
  }

  static override fetchDataNeededForExport(
    col: ColDef,
    data: any[],
    injector: Injector,
  ): Observable<Record<string, string>> {
    const uniqueKeys: LabelKey[] = [];
    data.forEach((item) => {
      const colValue = item[col.field || ''];
      if (colValue == null) {
        return;
      }

      const values = Array.isArray(colValue) ? colValue : [colValue];
      values.forEach((value) => {
        if (value != null && !uniqueKeys.includes(value)) {
          uniqueKeys.push(value);
        }
      });
    });

    if (uniqueKeys.length === 0) {
      return of({});
    }

    const labelService = injector.get(LabelService);
    return labelService.getMultipleLabelsWithSameType(uniqueKeys);
  }

  static override fetchDataToCache(
    col: ColDef,
    data: any[],
    injector: Injector,
  ): Observable<Record<string, string>> {
    return LabelCellRendererComponent.fetchDataNeededForExport(
      col,
      data,
      injector,
    );
  }
}
