import { Pipe, PipeTransform } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';

@Pipe({
  standalone: true,
  name: 'transactionDispatchLabel',
  pure: true
})
export class TransactionDispatchLabelPipe implements PipeTransform {
  transform(type?: SpecimenTransaction['type']): string {
    if (type === 'HRX.typeGiftOutgoing') {
      return 'specimen gift';
    } else if (type === 'HRX.typeExchangeOutgoing') {
      return 'specimen exchange';
    } else if (type === 'HRX.typeVirtualLoanOutgoing') {
      return 'virtual loan';
    } else {
      return 'specimen loan';
    }
  }
}
