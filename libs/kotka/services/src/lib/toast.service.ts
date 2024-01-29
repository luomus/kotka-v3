import { Injectable, NgZone, TemplateRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ToastOptions {
  className?: string;
  delay?: number;
  autoHide?: boolean;
  pause?: boolean;
  pauseDuration?: number;
}
export interface ToastInfo extends ToastOptions {
  textOrTpl: string | TemplateRef<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts$: Observable<ToastInfo[]>;
  private toastsSubject = new BehaviorSubject<ToastInfo[]>([]);

  private pausedToasts: (string | TemplateRef<unknown>)[] = [];

  constructor(
    private ngZone: NgZone
  ) {
    this.toasts$ = this.toastsSubject.asObservable();
  }

  show(textOrTpl: string | TemplateRef<unknown>, options: ToastOptions = {}) {
    if (this.pausedToasts.includes(textOrTpl)) {
      return;
    }

    const newToast = { textOrTpl, ...options };
    this.ngZone.run(() => {
      this.toasts$.pipe(take(1)).subscribe(toasts => {
        this.toastsSubject.next([...toasts, newToast]);
      });
    });

    if (options.pause) {
      this.pauseToast(textOrTpl, options.pauseDuration);
    }
  }

  remove(toast: ToastInfo) {
    this.toasts$.pipe(take(1)).subscribe(toasts => {
      this.toastsSubject.next(toasts.filter(t => t !== toast));
    });
  }

  showSuccess(message: string, options?: ToastOptions) {
    this.show(message, { ...options, className: 'bg-success text-light' });
  }

  showError(message: string, options?: ToastOptions) {
    options = options || {};
    if (!options.delay) {
      options.delay = 7000;
    }
    this.show(message, { ...options, className: 'bg-danger text-light' });
  }

  showInfo(message: string, options?: ToastOptions) {
    this.show(message, { ...options, className: 'bg-info text-light' });
  }

  showWarning(message: string, options?: ToastOptions) {
    this.show(message, { ...options, className: 'bg-warning text-light' });
  }

  showGenericError(options?: ToastOptions) {
    const message = 'An unexpected error occurred.';
    this.showError(message, options);
  }

  private pauseToast(textOrTpl: string | TemplateRef<unknown>, pauseDuration = 10000) {
    this.pausedToasts.push(textOrTpl);
    setTimeout(() => {
      this.pausedToasts = this.pausedToasts.filter(t => t !== textOrTpl);
    }, pauseDuration);
  }
}
