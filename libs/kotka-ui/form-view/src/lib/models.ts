import { KotkaDocumentObject } from '@kotka/shared/models';

export interface PrefilledFormData<S extends KotkaDocumentObject> {
  data: Partial<S>;
  hasChanges?: boolean;
}
