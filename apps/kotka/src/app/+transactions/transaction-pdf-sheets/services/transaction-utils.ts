import { SpecimenTransaction } from '@luomus/laji-schema';

export class TransactionUtils {
  static isGiftOrExchange(transaction: SpecimenTransaction): boolean {
    return [
      'HRX.typeGiftIncoming',
      'HRX.typeGiftOutgoing',
      'HRX.typeExchangeIncoming',
      'HRX.typeExchangeOutgoing'
    ].includes(transaction.type);
  }
}
