import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { asSpecimenTransaction, KotkaDocumentObjectType, SpecimenTransaction } from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';

@Component({
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="formId"
      [dataType]="dataType"
      (formInit)="onFormInit($event.lajiForm, asSpecimenTransaction($event.formData))"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionVersionHistoryComponent {
  formId = globals.transactionFormId;
  dataType = KotkaDocumentObjectType.transaction;

  asSpecimenTransaction = asSpecimenTransaction;

  constructor(
    private transactionFormEmbedService: TransactionFormEmbedService
  ) {}

  onFormInit(lajiForm: LajiFormComponent, formData: SpecimenTransaction) {
    this.transactionFormEmbedService.initEmbeddedComponents(lajiForm, formData);
    this.transactionFormEmbedService.setEmbeddedComponentsDisabled(true);
  }
}
