import { InjectionToken } from '@angular/core';

export interface Globals {
  datasetFormId: string;
  organizationFormId: string;
  transactionFormId: string;
  specimenFormId: string;
  imageMetadataFormId: string;
}

export const WINDOW = new InjectionToken<Window>('window');
export const OLD_KOTKA_URL = new InjectionToken<string>('oldKotkaUrl');
export const GLOBALS = new InjectionToken<Globals>('globals');
