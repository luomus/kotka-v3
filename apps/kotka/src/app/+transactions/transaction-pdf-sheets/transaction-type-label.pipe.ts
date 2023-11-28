import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'transactionTypeLabel',
  pure: true
})
export class TransactionTypeLabelPipe implements PipeTransform {
  transform(value: string = ''): string {
    if (value === 'HRX.typeGiftOutgoing') {
      return 'specimen gift';
    } else if (value === 'HRX.typeExchangeOutgoing') {
      return 'specimen exchange'
    } else if (value === 'HRX.typeVirtualLoanOutgoing') {
      return 'virtual loan';
    } else {
      return 'specimen loan'
    }
  }
}
