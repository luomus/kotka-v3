import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  KotkaDocumentType, IndexType, FieldAggregate
} from '@kotka/shared/models';
import { FormsModule } from '@angular/forms';
import {
  DataTypeNamePipePipe
} from '@kotka/ui/core';
import { AggregationsComponent } from './aggregations.component';
import {
  AggregationsSettings,
  AggregationsSettingsModalComponent,
} from './aggregations-settings-modal.component';
import { from } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  LocationFilterModalComponent,
} from './location-filter-modal.component';
import {
  FieldData,
  FieldValue,
  LocationFilter,
  SpecimenSearchFilters,
} from '../models/models';
import { DecimalPipe } from '@angular/common';

export const INDEX_OPTIONS: IndexType[] = [
  'unit',
  'identification',
  'typeSpecimen',
  'sample',
];

@Component({
  selector: 'kotka-specimen-search-filters',
  templateUrl: './specimen-search-filters.component.html',
  styleUrls: ['./specimen-search-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AggregationsComponent,
    DataTypeNamePipePipe,
    DecimalPipe,
  ],
})
export class SpecimenSearchFiltersComponent implements OnDestroy {
  private modalService = inject(NgbModal);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;

  index = model.required<IndexType>();
  aggregateFields = model.required<string[]>();
  aggregateSize = model.required<number>();
  filters = model.required<SpecimenSearchFilters>();

  aggregateResults = input<FieldAggregate[]>();
  fieldData = input.required<FieldData>();

  defaultAggregateFields = input.required<string[]>();
  defaultAggregateSize = input.required<number>();
  minAggregateSize = input.required<number>();
  maxAggregateSize = input.required<number>();

  aggregateFieldOrder = signal<string[] | undefined>(undefined);

  indexOptions = INDEX_OPTIONS;

  private modalRef?: NgbModalRef;

  ngOnDestroy() {
    this.modalRef?.close();
  }

  onFieldValuesChange(fieldValues: FieldValue[]) {
    this.filters.update((filters) => ({
      ...filters,
      fieldValues,
    }));
  }

  removeLocationFilter() {
    this.filters.update((filters) => ({
      ...filters,
      location: undefined,
    }));
  }

  openLocationFilterModal() {
    this.modalRef = this.modalService.open(LocationFilterModalComponent, {
      size: 'md',
      windowClass: 'd-flex',
      modalDialogClass: 'd-flex w-100',
    });

    this.modalRef.componentInstance.locationFilter.set(this.filters().location);

    from(this.modalRef.result).subscribe({
      next: (locationFilter?: LocationFilter) => {
        this.filters.update((filters) => ({
          ...filters,
          location: locationFilter,
        }));
      },
      error: () => undefined,
    });
  }

  openAggregateSettingsModal() {
    this.modalRef = this.modalService.open(AggregationsSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(
      this.fieldData().allAggregateColumns,
    );
    this.modalRef.componentInstance.columnSettings.set({
      selected: this.aggregateFields(),
      order: this.aggregateFieldOrder() || this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.defaultColumnSettings.set({
      selected: this.defaultAggregateFields(),
      order: this.fieldData().allAggregateFields,
    });
    this.modalRef.componentInstance.filterSize.set(this.aggregateSize());
    this.modalRef.componentInstance.defaultFilterSize.set(
      this.defaultAggregateSize(),
    );
    this.modalRef.componentInstance.minFilterSize.set(this.minAggregateSize());
    this.modalRef.componentInstance.maxFilterSize.set(this.maxAggregateSize());

    from(this.modalRef.result).subscribe({
      next: (settings: AggregationsSettings) => {
        this.aggregateFields.set(settings.selected);
        this.aggregateFieldOrder.set(settings.order);
        this.aggregateSize.set(settings.filterSize);
      },
      error: () => undefined,
    });
  }
}
