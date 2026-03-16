import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  DifferenceObjectValue,
  isPatch,
  LajiForm
} from '@kotka/shared/models';
import { ViewerFieldComponent } from './viewer-field.component';


@Component({
  selector: 'kui-viewer-multilang',
  template: `
    @for (lang of languages; track lang) {
      @if (data()?.[lang] || differenceDataByLang()[lang]) {
        <kui-viewer-field
          [label]="field().label + ' (' + lang + ')'"
          [field]="field()"
          [data]="data()?.[lang]"
          [differenceData]="differenceDataByLang()[lang]"
        ></kui-viewer-field>
      }
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldComponent],
})
export class ViewerMultilangComponent {
  languages = ['en', 'fi', 'sv'];

  field = input.required<LajiForm.Field>();
  data = input<any>();
  differenceData = input<DifferenceObjectValue | undefined>();

  differenceDataByLang = computed(() => {
    const result: Record<string, DifferenceObjectValue | undefined> = {};

    const data = this.differenceData();

    if (Array.isArray(data)) {
      console.warn('Difference data is in a wrong format for a multi lang field');
    } else if (isPatch(data)) {
      this.languages.forEach(lang => {
        if (data.value[lang]) {
          result[lang] = {
            op: data.op,
            value: data.value[lang],
          };
        }
      });
    } else {
      this.languages.forEach(lang => {
        result[lang] = data?.[lang];
      });
    }

    return result;
  });
}
