import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelPipe } from '@kotka/ui/pipes';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { IFilterParams } from '@ag-grid-community/core';

import { BooleanFilterModel } from '../models/models';

@Component({
  imports: [FormsModule, LabelPipe],
  template: `
    <div class="ag-filter-wrapper">
      <div class="ag-filter-body-wrapper ag-simple-filter-body-wrapper">
        <div class="ag-select ag-filter-select">
          <select
            class="ag-picker-field-wrapper"
            [(ngModel)]="value"
            (ngModelChange)="updateFilter()"
            >
            @for (option of [undefined, true, false]; track option) {
              <option
                [ngValue]="option"
                >
                {{ option | label }}
              </option>
            }
          </select>
        </div>
      </div>
    </div>
    `,
})
export class BooleanFilterComponent implements IFilterAngularComp {
  params!: IFilterParams;
  value?: boolean;

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.value === true || this.value === false;
  }

  doesFilterPass(): boolean {
    throw new Error('Not implemented');
  }

  getModel(): BooleanFilterModel | null {
    if (!this.isFilterActive()) {
      return null;
    }

    return {
      filterType: 'boolean',
      type: 'equals',
      filter: this.value!,
    };
  }

  setModel(model?: BooleanFilterModel | null) {
    this.value = model ? model.filter : undefined;
  }

  updateFilter() {
    this.params.filterChangedCallback();
  }

  onFloatingFilterChanged(filter?: boolean) {
    this.value = filter;
    this.updateFilter();
  }
}
