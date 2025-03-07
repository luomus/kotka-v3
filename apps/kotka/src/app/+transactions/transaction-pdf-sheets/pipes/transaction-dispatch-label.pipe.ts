import { Pipe, PipeTransform } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { TransactionTypeLabelPipe } from './transaction-type-label.pipe';

@Pipe({
  name: 'transactionDispatchLabel',
  pure: true
})
export class TransactionDispatchLabelPipe implements PipeTransform {
  transform(type?: SpecimenTransaction['type']): string {
    const loanType = type === 'HRX.typeVirtualLoanOutgoing' ? 'virtual' : 'specimen';
    return loanType + ' ' + new TransactionTypeLabelPipe().transform(type);
  }
}
