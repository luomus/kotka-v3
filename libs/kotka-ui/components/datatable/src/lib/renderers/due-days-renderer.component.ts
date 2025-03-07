import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';

@Component({
  selector: 'kui-due-days-renderer',
  template: ` <span title="{{ result }}">{{ result }}</span> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DueDaysRendererComponent extends CellRendererComponent {
  result?: number;

  override paramsChange() {
    if (!this.params.value) {
      this.result = undefined;
      return;
    }

    this.result = DueDaysRendererComponent.getDueDate(this.params.value);
  }

  static getDueDate(value: string) {
    const date1 = new Date();
    const date2 = new Date(value);

    return this.dateDiffInDays(date1, date2);
  }

  static dateDiffInDays(date1: Date, date2: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
    );
    const utc2 = Date.UTC(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate(),
    );
    return Math.floor((utc2 - utc1) / msPerDay);
  }

  static override getExportValue(value: string | undefined): string {
    if (!value) {
      return '';
    }

    return '' + DueDaysRendererComponent.getDueDate(value);
  }
}
