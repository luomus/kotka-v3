import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  Signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ViewerComponent as UiViewerComponent, ViewerField } from '@kotka/ui/viewer';
import {
  SpinnerComponent,
} from '@kotka/ui/components';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Document, KotkaDocumentType, LajiForm } from '@kotka/shared/models';
import { ToFullUriPipe } from '@kotka/ui/core';

@Component({
  selector: 'kotka-specimen-viewer-content',
  templateUrl: './specimen-viewer-content.component.html',
  styleUrls: ['./specimen-viewer-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UiViewerComponent,
    SpinnerComponent,
    NgbAlert,
    ToFullUriPipe,
  ],
})
export class SpecimenViewerContentComponent {
  loading = input<boolean>(false);
  error = input<string | undefined>();
  fields = input<LajiForm.Field[]>();
  document = input<Document>();

  dataType = KotkaDocumentType.specimen;

  private filteredFields = [
    'datatype',
    'owner',
    'gatherings.units.primarySpecimen',
  ];

  private unitLabelTpl = viewChild<TemplateRef<unknown>>('unitLabelTpl');
  private sampleLabelTpl = viewChild<TemplateRef<unknown>>('sampleLabelTpl');

  private customLabelTemplates: Signal<
    Record<string, TemplateRef<unknown> | undefined>
  > = computed(() => ({
    'gatherings.units': this.unitLabelTpl(),
    'gatherings.units.samples': this.sampleLabelTpl(),
  }));

  viewerFields = computed(() => {
    const fields = this.fields();
    if (!fields) return undefined;
    return this.getFields(fields);
  });

  private getFields(fields: LajiForm.Field[], path = ''): ViewerField[] {
    return fields
      .filter((field): boolean => {
        return !this.filteredFields.includes(`${path}${field.name}`);
      })
      .map((field): ViewerField => {
        const fullName = `${path}${field.name}`;

        if (field.fields) {
          return {
            ...field,
            fields: this.getFields(field.fields, `${fullName}.`),
            collectionLabelTemplate: this.customLabelTemplates()[fullName],
          };
        }

        return field;
      });
  }
}

