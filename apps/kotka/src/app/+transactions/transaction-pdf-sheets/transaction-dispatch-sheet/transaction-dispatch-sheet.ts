import { Component, Input } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { LajiOrganization } from '@kotka/shared/models';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  standalone: true,
  imports: [CommonModule, SharedModule],
  selector: 'kotka-transaction-dispatch-sheet',
  templateUrl: './transaction-dispatch-sheet.html'
})
export class TransactionDispatchSheetComponent {
  @Input() data?: SpecimenTransaction;
  @Input() organization?: LajiOrganization;
}
