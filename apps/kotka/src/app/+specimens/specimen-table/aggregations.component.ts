import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Aggregations } from '@kotka/shared/models';
import { COUNT_PRECISION_THRESHOLD } from '@kotka/ui/core';

@Component({
  selector: 'kotka-aggregations',
  template: `
    @if (aggregations(); as aggregations) {
      @for (aggregateField of aggregateFields(); track $index) {
        <div class="mt-2">
          <strong>
            {{ aggregateField }}
            @let count = aggregations[aggregateField + '_count']?.value || 0;
            ({{ count > countPrecisionThreshold ? '~' : '' }}{{ count }})
          </strong>
          @for (aggregation of aggregations[aggregateField]?.buckets; track $index) {
            <button class="btn btn-link d-block p-0 text-decoration-none">
              {{ aggregation.key }} ({{ aggregation.doc_count }})
            </button>
          }
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregationsComponent {
  aggregations = input<Aggregations | undefined>(undefined);
  aggregateFields = input<string[]>([]);

  countPrecisionThreshold = COUNT_PRECISION_THRESHOLD;
}

