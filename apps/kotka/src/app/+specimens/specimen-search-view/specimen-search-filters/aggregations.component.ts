import { ChangeDetectionStrategy, Component, computed, input, model, Signal } from '@angular/core';
import { AggregationBucketKey, AggregateValue, FieldAggregate } from '@kotka/shared/models';

export interface FieldValue {
  field: string;
  value: AggregationBucketKey;
}

interface AggregateValueWithSelected extends AggregateValue {
  selected: boolean;
}

interface FieldAggregatesWithSelected extends FieldAggregate {
  values: AggregateValueWithSelected[];
}

@Component({
  selector: 'kotka-aggregations',
  template: `
    @for (aggregate of aggregatesWithSelected(); track $index) {
      <div class="mt-2">
        <strong>
          {{ aggregate.field }}
          ({{ aggregate.countUnprecise ? '~' : '' }}{{ aggregate.count }})
        </strong>
        @for (value of aggregate.values; track $index) {
          @if (value.selected) {
            <div class="d-flex align-items-center">
              <span class="me-2">{{ value.value }} ({{ value.docCount }})</span>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                aria-label="Remove selection"
                (click)="onRemove(aggregate.field, value.value)"
              >
                <i class="fa fa-xmark"></i>
              </button>
            </div>
          } @else {
            <button
              class="btn btn-link d-block p-0 text-decoration-none border-0"
              (click)="onSelect(aggregate.field, value.value)"
            >
              {{ value.value }} ({{ value.docCount }})
            </button>
          }
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregationsComponent {
  selected = model<FieldValue[]>();

  aggregates = input<FieldAggregate[]>([]);

  aggregatesWithSelected: Signal<FieldAggregatesWithSelected[]>;

  constructor() {
    this.aggregatesWithSelected = computed(() =>
      this.aggregates().map(result => ({
        ...result,
        values: result.values.map(value => ({
          ...value,
          selected: this.isSelected(result.field, value.value),
        }))
      }))
    );
  }

  onSelect(field: string, value: AggregationBucketKey) {
    if (this.isSelected(field, value)) {
      return;
    }

    this.selected.set([...(this.selected() || []), { field, value }]);
  }

  onRemove(field: string, value: AggregationBucketKey) {
    this.selected.set(
      (this.selected() || []).filter(
        (selection) =>
          !(selection.field === field && selection.value === value),
      ),
    );
  }

  private isSelected(field: string, value: AggregationBucketKey): boolean {
    return (this.selected() || []).some(
      (selection) => selection.field === field && selection.value === value,
    );
  }
}
