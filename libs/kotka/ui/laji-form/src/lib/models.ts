export interface Notifier {
  showSuccess(msg: string): void;
  showInfo(msg: string): void;
  showWarning(msg: string): void;
  showError(msg: string): void;
}
