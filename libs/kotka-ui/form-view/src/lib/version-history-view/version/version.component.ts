import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, Output, ViewChild
} from '@angular/core';
import {
  LajiForm,
  StoreVersion,
  MainKotkaDocumentObjectType,
  KotkaDocumentObjectMap,
} from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { SpinnerComponent } from '@kotka/ui/components';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MetaFieldsComponent } from '../../meta-fields/meta-fields.component';
import { RouterLink } from '@angular/router';
import { DataTypeNamePipePipe } from '@kotka/ui/core';


@Component({
  selector: 'kotka-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SpinnerComponent,
    NgbAlert,
    MetaFieldsComponent,
    LajiFormComponent,
    RouterLink,
    DataTypeNamePipePipe,
  ],
})
export class VersionComponent<
  T extends MainKotkaDocumentObjectType = MainKotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T],
> implements OnChanges
{
  @Input() dataType?: T;

  @Input() version?: number;
  @Input() versionList?: StoreVersion[];

  @Input() form?: LajiForm.SchemaForm;
  @Input() data?: S;

  previousVersion?: number;
  nextVersion?: number;

  @Output() formInit = new EventEmitter<{
    lajiForm: LajiFormComponent;
    formData: S;
  }>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  ngOnChanges() {
    if (this.version !== undefined && this.versionList?.length) {
      const idx = this.versionList.findIndex(
        (val) => val.version === this.version,
      );

      this.previousVersion =
        idx > 0 ? this.versionList[idx - 1].version : undefined;
      this.nextVersion =
        idx !== this.versionList.length - 2
          ? this.versionList[idx + 1].version
          : undefined;
    }
  }

  onFormReady(formData: S) {
    if (this.lajiForm) {
      this.formInit.emit({ lajiForm: this.lajiForm, formData });
    }
  }
}
