import { ChangeDetectionStrategy, Component, computed, input, model, Signal } from '@angular/core';
import { AggregationBucketKey, AggregateValue, FieldAggregate } from '@kotka/shared/models';
import { FieldData, FieldValue } from '../models/models';

interface ExtendedAggregateValue extends AggregateValue {
  selected: boolean;
}

interface ExtendedFieldAggregate extends FieldAggregate {
  label: string;
  values: ExtendedAggregateValue[];
}

@Component({
  selector: 'kotka-aggregations',
  template: `
    @for (aggregate of aggregatesWithSelected(); track $index) {
      <div class="mt-2">
        <strong>
          {{ aggregate.label }}
          ({{ aggregate.countUnprecise ? '~' : '' }}{{ aggregate.count }})
        </strong>
        @for (value of aggregate.values; track $index) {
          <div class="text-break">
            @if (value.selected) {
              <span class="me-2">{{ value.value }} ({{ value.docCount }})</span>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                aria-label="Remove selection"
                (click)="onRemove(aggregate.field, value.value)"
              >
                <i class="fa fa-xmark"></i>
              </button>
            } @else {
              <button
                class="btn btn-link d-inline p-0 text-decoration-none border-0 text-left"
                (click)="onSelect(aggregate.field, value.value)"
              >
                {{ value.value }} ({{ value.docCount }})
              </button>
            }
          </div>
        }
      </div>
    }
  `,
  host: {
    class: 'pe-3'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregationsComponent {
  fieldValues = model.required<FieldValue[]>();

  aggregates = input<FieldAggregate[]>([]);
  fieldData = input.required<FieldData>();

  aggregatesWithSelected: Signal<ExtendedFieldAggregate[]>;

  constructor() {
    this.aggregatesWithSelected = computed(() =>
      this.aggregates().map((result) => ({
        ...result,
        label: this.fieldData().fieldMap?.[result.field]?.label || result.field,
        values: result.values.map((value) => ({
          ...value,
          selected: this.isSelected(result.field, value.value),
        })),
      })),
    );
  }

  onSelect(field: string, value: AggregationBucketKey) {
    if (this.isSelected(field, value)) {
      return;
    }

    this.fieldValues.set([...(this.fieldValues() || []), { field, value }]);
  }

  onRemove(field: string, value: AggregationBucketKey) {
    this.fieldValues.set(
      (this.fieldValues() || []).filter(
        (fieldValue) =>
          !(fieldValue.field === field && fieldValue.value === value),
      ),
    );
  }

  private isSelected(field: string, value: AggregationBucketKey): boolean {
    return (this.fieldValues() || []).some(
      (fieldValue) => fieldValue.field === field && fieldValue.value === value,
    );
  }
}
