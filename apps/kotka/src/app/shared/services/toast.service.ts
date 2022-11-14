import { Injectable, TemplateRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ToastOptions {
  className?: string;
  delay?: number;
  autoHide?: boolean;
}
export interface ToastInfo extends ToastOptions {
  textOrTpl: string | TemplateRef<any>;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts$: Observable<ToastInfo[]>;
  private toastsSubject = new BehaviorSubject<ToastInfo[]>([]);

  constructor() {
    this.toasts$ = this.toastsSubject.asObservable();
  }

  show(textOrTpl: string | TemplateRef<any>, options: ToastOptions = {}) {
    const newToast = { textOrTpl, ...options };
    this.toasts$.pipe(take(1)).subscribe(toasts => {
      this.toastsSubject.next([...toasts, newToast]);
    });
  }

  remove(toast: ToastInfo) {
    this.toasts$.pipe(take(1)).subscribe(toasts => {
      this.toastsSubject.next(toasts.filter(t => t !== toast));
    });
  }

  showSuccess(message: string) {
    this.show(message, { className: 'bg-success text-light' });
  }

  showError(message: string) {
    this.show(message, { className: 'bg-danger text-light', autoHide: false });
  }

  showInfo(message: string) {
    this.show(message, { className: 'bg-info text-light' });
  }

  showWarning(message: string) {
    this.show(message, { className: 'bg-warning text-light' });
  }
}
