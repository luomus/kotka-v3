import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum EventTypes {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}
export interface ToastEvent {
  type: EventTypes;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toastEvents: Observable<ToastEvent>;
  private _toastEvents = new Subject<ToastEvent>();

  constructor() {
    this.toastEvents = this._toastEvents.asObservable();
  }

  showSuccess(message: string) {
    this._toastEvents.next({
      message,
      type: EventTypes.Success,
    });
  }

  showError(message: string) {
    this._toastEvents.next({
      message,
      type: EventTypes.Error,
    });
  }

  showInfo(message: string) {
    this._toastEvents.next({
      message,
      type: EventTypes.Info,
    });
  }

  showWarning(message: string) {
    this._toastEvents.next({
      message,
      type: EventTypes.Warning,
    });
  }
}
