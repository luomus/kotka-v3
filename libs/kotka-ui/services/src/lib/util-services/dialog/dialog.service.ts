import { Injectable } from '@angular/core';
import { Observable, of, from, catchError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from './confirm-modal.component';

interface DialogConfig {
  message: string;
  showCancel: boolean;
  confirmLabel?: string;
}

interface AlertConfig extends Pick<DialogConfig, 'message'> {
  showCancel: false;
}

interface ConfirmConfig extends Pick<DialogConfig, 'message' | 'confirmLabel'> {
  showCancel: true;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  constructor(private modalService: NgbModal) {}

  alert(message: string): Observable<boolean> {
    return this.createDialog<AlertConfig>({ message, showCancel: false });
  }

  confirm(message: string, confirmLabel?: string): Observable<boolean> {
    return this.createDialog<ConfirmConfig>({
      message,
      showCancel: true,
      confirmLabel,
    });
  }

  private createDialog<T extends DialogConfig>(
    options: T,
  ): Observable<boolean> {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      backdrop: 'static',
      size: 'sm',
    });

    modalRef.componentInstance.message = options.message;
    modalRef.componentInstance.showCancel = options.showCancel;
    if (options.confirmLabel) {
      modalRef.componentInstance.confirmLabel = options.confirmLabel;
    }

    return from(modalRef.result).pipe(
      catchError(() => {
        return of(false);
      }),
    );
  }
}
