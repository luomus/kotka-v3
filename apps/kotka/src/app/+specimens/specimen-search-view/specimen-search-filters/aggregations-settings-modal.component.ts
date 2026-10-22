import {
  ChangeDetectionStrategy,
  Component, inject, model,
} from '@angular/core';
import { ColDefWithExtra, ColumnSettings, ColumnSettingsModalComponent } from '@kotka/ui/datatable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

export interface AggregationsSettings extends ColumnSettings {
  filterSize: number;
}

@Component({
  selector: 'kotka-aggregations-settings-modal',
  template: `
    <kui-column-settings-modal
      title="Select fields"
      description="Select fields that are displayed on the sidebar."
      searchLabel="Search fields:"
      [columns]="columns()"
      [settings]="columnSettings()"
      [defaultSettings]="defaultColumnSettings()"
      [closeModalOnConfirm]="false"
      (confirmClick)="onConfirm($event)"
      (resetClick)="onReset()"
    >
      <div kuiColumnSettingsModalExtra class="mt-3">
        <label class="form-label mb-1 fw-semibold" for="filterSize">
          Filter size:
        </label>
        <input
          id="filterSize"
          type="number"
          class="form-control mb-2"
          [min]="minFilterSize()"
          [max]="maxFilterSize()"
          [(ngModel)]="filterSize"
        />
      </div>
    </kui-column-settings-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ColumnSettingsModalComponent, FormsModule],
})
export class AggregationsSettingsModalComponent {
  modal = inject(NgbActiveModal);

  columns = model(<ColDefWithExtra[]>[]);
  columnSettings = model(<ColumnSettings>{ selected: [], order: [] });
  defaultColumnSettings = model(<ColumnSettings>{ selected: [], order: [] });

  filterSize = model<number | null>(10);
  defaultFilterSize = model(10);

  minFilterSize = model(0);
  maxFilterSize = model(100);

  onConfirm(columnSettings: ColumnSettings) {
    let filterSize = this.filterSize();
    if (filterSize === null || filterSize < this.minFilterSize() || filterSize > this.maxFilterSize()) {
      filterSize = this.defaultFilterSize();
    }
    this.modal.close({...columnSettings, filterSize});
  }

  onReset() {
    this.filterSize.set(this.defaultFilterSize());
  }
}
