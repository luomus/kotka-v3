import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, Output, ViewChild
} from '@angular/core';
import { LajiForm, StoreVersion, KotkaDocumentObject } from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MetaFieldsComponent } from '../../meta-fields/meta-fields.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SpinnerComponent, NgbAlert, MetaFieldsComponent, LajiFormComponent, RouterLink],
})
export class VersionComponent<S extends KotkaDocumentObject>
  implements OnChanges
{
  @Input() visibleDataTypeName?: string;

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
