import { Pipe, PipeTransform } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';

@Pipe({
  standalone: true,
  name: 'transactionTypeLabel',
  pure: true
})
export class TransactionTypeLabelPipe implements PipeTransform {
  transform(type?: SpecimenTransaction['type']): string {
    if (type === 'HRX.typeExchangeIncoming' || type === 'HRX.typeExchangeOutgoing') {
      return 'exchange';
    } else if (type === 'HRX.typeGiftIncoming' || type === 'HRX.typeGiftOutgoing') {
      return 'gift';
    }
    return 'loan';
  }
}
