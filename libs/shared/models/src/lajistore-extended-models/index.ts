export * from './extended-models';

import { Dataset, SpecimenTransaction } from '../models';

export function asDataset(data: unknown): Dataset {
  return data as Dataset;
}
export function asSpecimenTransaction(data: unknown): SpecimenTransaction {
  return data as SpecimenTransaction;
}
export function asPartialSpecimenTransaction(data: unknown): Partial<SpecimenTransaction> {
  return data as Partial<SpecimenTransaction>;
}
