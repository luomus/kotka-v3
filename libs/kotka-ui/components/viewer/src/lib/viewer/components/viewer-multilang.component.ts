import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  DifferenceObject,
  DifferenceObjectPatch,
  isDifferenceObjectPatch,
  LajiForm,
} from '@kotka/shared/models';
import { ViewerFieldComponent } from './viewer-field.component';


@Component({
  selector: 'kui-viewer-multilang',
  template: `
    @if (field) {
      @for (lang of ['en', 'fi', 'sv']; track lang) {
        @if (
          data?.[lang] ||
          differenceDataObject?.[lang] ||
          differenceDataPatch?.value?.[lang]
          ) {
          <kui-viewer-field
            [label]="field.label + ' (' + lang + ')'"
            [field]="field"
            [data]="data?.[lang]"
            [differenceData]="
              differenceDataPatch
                ? {
                    op: differenceDataPatch.op,
                    value: differenceDataPatch.value[lang],
                  }
                : $any(differenceDataObject?.[lang])
            "
        ></kui-viewer-field>
      }
    }
    }
    `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldComponent],
})
export class ViewerMultilangComponent {
  @Input() field?: LajiForm.Field;
  @Input() data?: any;
  @Input() set differenceData(
    differenceData: DifferenceObject | DifferenceObjectPatch | undefined,
  ) {
    this.differenceDataObject = undefined;
    this.differenceDataPatch = undefined;

    if (isDifferenceObjectPatch(differenceData)) {
      this.differenceDataPatch = differenceData;
    } else {
      this.differenceDataObject = differenceData;
    }
  }

  differenceDataObject?: DifferenceObject;
  differenceDataPatch?: DifferenceObjectPatch;
}
