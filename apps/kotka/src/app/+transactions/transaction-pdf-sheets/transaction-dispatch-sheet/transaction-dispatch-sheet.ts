import { Component } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { LajiOrganization } from '@kotka/shared/models';

@Component({
  selector: 'kotka-transaction-dispatch-sheet',
  templateUrl: './transaction-dispatch-sheet.html'
})
export class TransactionDispatchSheetComponent {
  data?: SpecimenTransaction;
  organization?: LajiOrganization;
}
