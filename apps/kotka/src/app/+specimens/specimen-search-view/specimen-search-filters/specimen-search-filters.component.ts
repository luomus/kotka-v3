import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import {
  DatatableLoadedData,
} from '@kotka/ui/datatable';
import {
  KotkaDocumentType, IndexType, FieldAggregate
} from '@kotka/shared/models';
import { FormsModule } from '@angular/forms';
import {
  DataTypeNamePipePipe
} from '@kotka/ui/core';
import { AggregationsComponent, FieldValue } from './aggregations.component';
import {
  AggregationsSettings,
  AggregationsSettingsModalComponent,
} from './aggregations-settings-modal.component';
import { from } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FieldData } from '../specimen-search-view/specimen-search-view.component';

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
  ],
})
export class SpecimenSearchFiltersComponent implements OnDestroy {
  private modalService = inject(NgbModal);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;

  index = model.required<IndexType>();
  aggregateFields = model.required<string[]>();
  aggregateSize = model.required<number>();
  filtersValue = model.required<FieldValue[]>();

  aggregateResults = input<FieldAggregate[]>();
  fieldData =  input.required<FieldData>();
  defaultAggregateFields = input.required<string[]>();
  defaultAggregateSize = input.required<number>();

  loadData = output<DatatableLoadedData<KotkaDocumentType.specimen, IndexType>>();

  aggregateFieldOrder = signal<string[] | undefined>(undefined);

  indexOptions = INDEX_OPTIONS;

  private modalRef?: NgbModalRef;

  ngOnDestroy() {
    this.modalRef?.close();
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
