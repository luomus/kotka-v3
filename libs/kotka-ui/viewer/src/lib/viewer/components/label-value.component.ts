import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelPipe, LabelKey, ApiLabelService } from '@kotka/ui/core';
import { getUri } from '@kotka/shared/utils';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'kui-label-value',
  template: `
    @if (linkData(); as linkData) {
      <a [routerLink]="linkData.routerLink" [queryParams]="linkData.queryParams">
        <span>{{ value() | label }}</span>
      </a>
    } @else {
      <span>{{ value() | label }}</span>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LabelPipe, RouterModule],
})
export class LabelValueComponent {
  private apiLabelService = inject(ApiLabelService);

  value = input<LabelKey>();

  linkData = computed(() => {
    const value = this.value();

    if (typeof value !== 'string') {
      return;
    }

    const apiLabelType = this.apiLabelService.getApiLabelType(value);
    if (!apiLabelType || !['organization', 'collection', 'dataset'].includes(apiLabelType)) {
      return undefined;
    }
    return {
      routerLink: '/view',
      queryParams: { uri: getUri(value) }
    };
  });
}
