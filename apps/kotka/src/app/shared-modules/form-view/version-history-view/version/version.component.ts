import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { LajiForm } from '@kotka/shared/models';
import { DataObject } from '../../../../shared/services/api-services/data.service';
import { FormApiClient } from '../../../../shared/services/api-services/form-api-client';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'kotka-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComponent {
  @Input() form?: LajiForm.SchemaForm;
  @Input() data?: DataObject;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
  ) {}
}
