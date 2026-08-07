import { Directive, HostListener, inject } from '@angular/core';
import { ComponentCanDeactivate, DialogService } from '@kotka/ui/core';
import { finalize, Observable, of, shareReplay } from 'rxjs';


@Directive()
export abstract class WithLeaveConfirmComponent
  implements ComponentCanDeactivate
{
  protected dialogService = inject(DialogService);

  private canDeactivateConfirm$?: Observable<boolean>;

  @HostListener('window:beforeunload')
  preventLeave(): boolean {
    return !this.requiresConfirm();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.requiresConfirm()) {
      return of(true);
    }

    if (this.canDeactivateConfirm$) {
      return this.canDeactivateConfirm$;
    }

    this.canDeactivateConfirm$ = this.dialogService
      .confirm('Are you sure you want to leave and discard unsaved changes?')
      .pipe(
        finalize(() => {
          this.canDeactivateConfirm$ = undefined;
        }),
        shareReplay(1),
      );

    return this.canDeactivateConfirm$;
  }

  abstract requiresConfirm(): boolean;
}
