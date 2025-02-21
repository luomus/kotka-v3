import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentObjectType, SpecimenTransaction } from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';
import {
  VersionHistoryViewComponent
} from '../../shared-modules/form-view/version-history-view/version-history-view.component';

@Component({
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="formId"
      [dataType]="dataType"
      [dataTypeName]="'transaction'"
      (formInit)="onFormInit($event.lajiForm, $event.formData)"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VersionHistoryViewComponent],
  providers: [TransactionFormEmbedService]
})
export class TransactionVersionHistoryComponent {
  formId = globals.transactionFormId;
  dataType: KotkaDocumentObjectType.transaction =
    KotkaDocumentObjectType.transaction;

  constructor(
    private transactionFormEmbedService: TransactionFormEmbedService,
  ) {}

  onFormInit(lajiForm: LajiFormComponent, formData: SpecimenTransaction) {
    this.transactionFormEmbedService.initEmbeddedComponents(lajiForm, formData);
    this.transactionFormEmbedService.setEmbeddedComponentsDisabled(true);
  }
}
