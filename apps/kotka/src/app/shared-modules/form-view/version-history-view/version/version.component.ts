import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { KotkaDocumentObject, LajiForm } from '@kotka/shared/models';
import { FormApiClient } from '../../../../shared/services/api-services/form-api-client';
import { ToastService } from '../../../../shared/services/toast.service';
import { StoreVersion } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComponent implements OnChanges {
  @Input() visibleDataTypeName?: string;

  @Input() version?: string;
  @Input() versionList?: StoreVersion[];

  @Input() form?: LajiForm.SchemaForm;
  @Input() data?: KotkaDocumentObject;

  previousVersion?: number;
  nextVersion?: number;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
  ) {}

  ngOnChanges() {
    if (this.version && this.versionList?.length) {
      const versionNbr = parseInt(this.version, 10);
      const idx = this.versionList.findIndex(val => val.version === versionNbr);

      this.previousVersion = idx > 0 ? this.versionList[idx - 1].version : undefined;
      this.nextVersion = idx !== this.versionList.length - 2 ? this.versionList[idx + 1].version : undefined;
    }
  }
}
