import { Component, inject } from '@angular/core';
import {
  IFloatingFilterParams,
  TextFilter,
  TextFilterModel,
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { ApiClient } from '@kotka/ui/core';
import {
  FetchAutocompleteResultsFunc,
  SelectComponent,
} from '@kotka/ui/components';
import { KotkaDocumentType } from '@kotka/shared/models';

export interface AutocompleteFilterParams {
  type:
    | KotkaDocumentType.dataset
    | KotkaDocumentType.organization
    | 'collection';
}

@Component({
  imports: [SelectComponent],
  template: `
    <div class="ag-floating-filter-input">
      <kui-select
        inputClassName="ag-input-field-input ag-text-field-input"
        [value]="currentFilter"
        [fetchResultsFunc]="fetchResultsFunc"
        (valueChange)="changeFilterValue($event)"
      ></kui-select>
    </div>
  `,
})
export class AutocompleteFloatingFilterComponent
  implements IFloatingFilterAngularComp<TextFilter>
{
  private apiClient = inject(ApiClient);

  params!: IFloatingFilterParams & AutocompleteFilterParams;

  currentFilter?: string;
  fetchResultsFunc: FetchAutocompleteResultsFunc;

  constructor() {
    this.fetchResultsFunc = this.getAutocompleteResults.bind(this);
  }

  agInit(
    params: IFloatingFilterParams<TextFilter> & AutocompleteFilterParams,
  ): void {
    this.params = params;
  }

  onParentModelChanged(parentModel?: TextFilterModel | null) {
    if (!parentModel?.filter) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.filter;
    }
  }

  changeFilterValue(value: string | null = null) {
    this.params.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }

  private getAutocompleteResults(term: string) {
    if (this.params.type === 'collection') {
      return this.apiClient.getCollectionAutocomplete(term);
    } else {
      return this.apiClient.getAutocomplete(this.params.type, term);
    }
  }
}
