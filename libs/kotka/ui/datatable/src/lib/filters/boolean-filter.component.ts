import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '@kotka/pipes';
import { IFilterAngularComp } from '@ag-grid-community/angular';
import { IFilterParams } from '@ag-grid-community/core';
import { NgForOf } from '@angular/common';
import { BooleanFilterModel } from '@kotka/shared/models';

@Component({
  standalone: true,
  imports: [FormsModule, NgForOf, PipesModule],
  template: `
    <div class="ag-filter-wrapper">
      <div class="ag-filter-body-wrapper ag-simple-filter-body-wrapper">
        <div class="ag-select ag-filter-select">
          <select
            class="ag-picker-field-wrapper"
            [(ngModel)]="value"
            (ngModelChange)="updateFilter()"
          >
            <option *ngFor="let option of [undefined, true, false]" [ngValue]="option">{{ option | label }}</option>
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

  getModel(): BooleanFilterModel|null {
    if (!this.isFilterActive()) {
      return null;
    }

    return {
      filterType: 'boolean',
      type: 'equals',
      filter: this.value!
    };
  }

  setModel(model: BooleanFilterModel|null) {
    this.value = model === null ? undefined : model.filter;
  }

  updateFilter() {
    this.params.filterChangedCallback();
  }

  onFloatingFilterChanged(filter?: boolean) {
    this.value = filter;
    this.updateFilter();
  }
}
