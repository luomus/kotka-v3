import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  Signal,
} from '@angular/core';
import {
  KotkaDocumentType, IndexType, FieldAggregate
} from '@kotka/shared/models';
import { FormsModule } from '@angular/forms';
import {
  DataTypeNamePipePipe,
  toMap,
  UserService,
} from '@kotka/ui/core';
import { getCleanedColumnSettings } from '@kotka/ui/datatable';
import { LocalStorageService } from 'ngx-webstorage';
import { isEqual } from 'lodash';
import { AggregationsComponent } from './aggregations.component';
import { AggregationsSettingsModalComponent } from './aggregations-settings-modal.component';
import { from } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  LocationFilterModalComponent,
} from './location-filter-modal.component';
import {
  AggregateSettings,
  FieldData,
  FieldValue,
  LocationFilter,
  SpecimenSearchFilters,
} from '../models/models';
import { DecimalPipe } from '@angular/common';
import { SpinnerComponent } from '@kotka/ui/components';

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
    SpinnerComponent,
  ],
})
export class SpecimenSearchFiltersComponent implements OnDestroy {
  private modalService = inject(NgbModal);
  private storage = inject(LocalStorageService);
  private userService = inject(UserService);

  dataType: KotkaDocumentType.specimen = KotkaDocumentType.specimen;

  index = model.required<IndexType>();
  filters = model.required<SpecimenSearchFilters>();
  aggregateSettings = model.required<AggregateSettings | undefined>();

  aggregateResults = input<FieldAggregate[]>();
  fieldData = input.required<FieldData>();

  defaultAggregateFields = input.required<string[]>();
  defaultAggregateSize = input.required<number>();
  minAggregateSize = input.required<number>();
  maxAggregateSize = input.required<number>();

  indexOptions = INDEX_OPTIONS;

  private modalRef?: NgbModalRef;

  private settingsKey: Signal<string>;
  private defaultAggregateSettings: Signal<AggregateSettings | undefined>;

  constructor() {
    this.settingsKey = computed(
      () =>
        `${this.dataType}-${this.index()}-aggregates-${this.userService.user()?.id}`,
    );

    this.defaultAggregateSettings = computed(() => {
      const allAggregateFields = this.fieldData().allAggregateFields;
      if (!allAggregateFields) {
        return undefined;
      }

      return {
        selected: this.defaultAggregateFields().filter((field) =>
          allAggregateFields.includes(field),
        ),
        order: allAggregateFields,
        size: this.defaultAggregateSize(),
      };
    });

    effect(() => {
      this.cleanAggregateSettings();
    });

    effect(() => {
      this.cleanFilterFields();
    });

    effect(() => {
      this.cleanFilterFieldValues();
    });

    effect(() => {
      const aggregateSettings = this.aggregateSettings();
      const defaultSettings = this.defaultAggregateSettings();

      if (!aggregateSettings && defaultSettings) {
        const storedSettings = this.storage.retrieve(this.settingsKey());
        this.aggregateSettings.set(storedSettings || defaultSettings);
      }
    });

    effect(() => {
      const aggregateSettings = this.aggregateSettings();

      if (aggregateSettings) {
        this.storage.store(this.settingsKey(), aggregateSettings);
      }
    });
  }

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
    const aggregateSettings = this.aggregateSettings();
    const defaultSettings = this.defaultAggregateSettings();

    if (!aggregateSettings || !defaultSettings) {
      return;
    }

    const { size: filterSize, ...columnSettings } = aggregateSettings;
    const { size: defaultFilterSize, ...defaultColumnSettings } =
      defaultSettings;

    this.modalRef = this.modalService.open(AggregationsSettingsModalComponent, {
      backdrop: 'static',
      size: 'md',
      modalDialogClass: 'scrollable-modal column-settings-modal',
    });

    this.modalRef.componentInstance.columns.set(
      this.fieldData().allAggregateColumns,
    );
    this.modalRef.componentInstance.columnSettings.set(columnSettings);
    this.modalRef.componentInstance.defaultColumnSettings.set(
      defaultColumnSettings,
    );
    this.modalRef.componentInstance.filterSize.set(filterSize);
    this.modalRef.componentInstance.defaultFilterSize.set(defaultFilterSize);
    this.modalRef.componentInstance.minFilterSize.set(this.minAggregateSize());
    this.modalRef.componentInstance.maxFilterSize.set(this.maxAggregateSize());

    from(this.modalRef.result).subscribe({
      next: (settings: AggregateSettings) => {
        this.aggregateSettings.set(settings);
      },
      error: () => undefined,
    });
  }

  private cleanAggregateSettings() {
    const settings = this.aggregateSettings();
    const defaultSettings = this.defaultAggregateSettings();

    if (!settings || !defaultSettings) {
      return;
    }

    const columnSettings = getCleanedColumnSettings(
      settings,
      defaultSettings,
      [],
    );

    const size =
      settings?.size !== undefined &&
      settings.size >= this.minAggregateSize() &&
      settings.size <= this.maxAggregateSize()
        ? settings.size
        : defaultSettings.size;

    const cleanedSettings: AggregateSettings = { ...columnSettings, size };

    if (!isEqual(cleanedSettings, this.aggregateSettings())) {
      this.aggregateSettings.set(cleanedSettings);
    }
  }

  private cleanFilterFields() {
    if (this.fieldData().fieldsLoading) {
      return;
    }

    const fieldValues = this.filters().fieldValues.filter(
      (filter) => this.fieldData().fieldMap?.[filter.field],
    );
    if (fieldValues.length !== this.filters().fieldValues.length) {
      this.filters.set({ ...this.filters(), fieldValues });
    }
  }

  private cleanFilterFieldValues() {
    const aggregates = this.aggregateResults();
    if (!aggregates) {
      return;
    }

    const aggregateMap = toMap(aggregates, 'field');

    const fieldValues = this.filters().fieldValues.filter((filter) =>
      aggregateMap[filter.field]?.values.some(
        (value) => value.value === filter.value,
      ),
    );
    if (fieldValues.length !== this.filters().fieldValues.length) {
      this.filters.set({ ...this.filters(), fieldValues });
    }
  }
}
