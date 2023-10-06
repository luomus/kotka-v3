import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, Output, ViewChild
} from '@angular/core';
import { LajiForm } from '@kotka/shared/models';
import { FormApiClient } from '../../../../shared/services/api-services/form-api-client';
import { ToastService } from '../../../../shared/services/toast.service';
import { DocumentObject, KotkaDocumentType, StoreVersion } from '@kotka/api-interfaces';
import { LajiFormComponent } from '@kotka/ui/laji-form';

@Component({
  selector: 'kotka-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComponent<T extends KotkaDocumentType> implements OnChanges {
  @Input() visibleDataTypeName?: string;

  @Input() version?: number;
  @Input() versionList?: StoreVersion[];

  @Input() form?: LajiForm.SchemaForm;
  @Input() data?: DocumentObject<T>;

  previousVersion?: number;
  nextVersion?: number;

  @Output() formInit = new EventEmitter<{ lajiForm: LajiFormComponent; formData: DocumentObject<T> }>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
  ) {}

  ngOnChanges() {
    if (this.version !== undefined && this.versionList?.length) {
      const idx = this.versionList.findIndex(val => val.version === this.version);

      this.previousVersion = idx > 0 ? this.versionList[idx - 1].version : undefined;
      this.nextVersion = idx !== this.versionList.length - 2 ? this.versionList[idx + 1].version : undefined;
    }
  }

  onFormReady(formData: DocumentObject<T>) {
    if (this.lajiForm) {
      this.formInit.emit({ lajiForm: this.lajiForm, formData });
    }
  }
}
