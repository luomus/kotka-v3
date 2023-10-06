import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentType } from '@kotka/api-interfaces';
import { KotkaDocumentObject, SpecimenTransaction } from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';

@Component({
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="'MHL.930'"
      [dataType]="dataType"
      (formInit)="onFormInit($event)"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionVersionHistoryComponent {
  dataType = KotkaDocumentType.transaction;

  constructor(
    private transactionFormEmbedService: TransactionFormEmbedService
  ) {}

  onFormInit(data: { lajiForm: LajiFormComponent; formData: KotkaDocumentObject }) {
    this.transactionFormEmbedService.initEmbeddedComponents(data.lajiForm, data.formData as SpecimenTransaction);
    this.transactionFormEmbedService.disableEmbeddedComponents();
  }
}
