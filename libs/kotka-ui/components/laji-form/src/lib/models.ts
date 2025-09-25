import { MediaMetadata } from '@luomus/laji-form/lib/components/LajiForm';
import { Image } from '@kotka/shared/models';

export interface Notifier {
  showSuccess(msg: string): void;
  showInfo(msg: string): void;
  showWarning(msg: string): void;
  showError(msg: string): void;
}

export interface FormMediaMetadata extends MediaMetadata {
  publicityRestrictions?: Image['publicityRestrictions'];
}
