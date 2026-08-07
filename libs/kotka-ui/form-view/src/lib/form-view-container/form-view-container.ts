import { ChangeDetectorRef, Directive, HostListener, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ComponentCanDeactivate, DialogService, navigationEnd$ } from '@kotka/ui/core';
import {
  finalize,
  from,
  Observable,
  of,
  shareReplay,
  Subscription,
} from 'rxjs';
import { FormViewComponent } from '../form-view/form-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaRootDocumentMap, KotkaMainDocumentType } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';

@Directive()
export class FormViewContainerComponent<
  T extends KotkaMainDocumentType = KotkaMainDocumentType,
  S extends KotkaRootDocumentMap[T] = KotkaRootDocumentMap[T]
> implements OnDestroy, ComponentCanDeactivate {
  editMode = signal(false);
  dataURI = signal<string | undefined>(undefined);

  copyData = signal<Partial<S> | undefined>(undefined);

  @ViewChild(FormViewComponent<T, S>, { static: true }) formViewComponent!: FormViewComponent<T, S>;

  private routeParamUpdateSub: Subscription;
  private canDeactivateConfirm$?: Observable<boolean>;

  protected dialogService = inject(DialogService);
  protected activeRoute = inject(ActivatedRoute);
  protected router = inject(Router);
  protected cdr = inject(ChangeDetectorRef);

  constructor() {
    this.setRouteParams();

    this.routeParamUpdateSub = navigationEnd$(this.router).subscribe(() => {
      this.setRouteParams();
    });
  }

  ngOnDestroy() {
    this.routeParamUpdateSub.unsubscribe();
  }

  hasChanges() {
    return this.formViewComponent.getFormHasChanges();
  }

  @HostListener('window:beforeunload')
  preventLeave(): boolean {
    return !this.hasChanges();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    if (this.canDeactivateConfirm$) {
      return this.canDeactivateConfirm$;
    }

    this.canDeactivateConfirm$ = this.dialogService.confirm(
      'Are you sure you want to leave and discard unsaved changes?',
    ).pipe(
      finalize(() => {
        this.canDeactivateConfirm$ = undefined;
      }),
      shareReplay(1)
    );

    return this.canDeactivateConfirm$;
  }

  onSaveSuccess(formData: S) {
    this.router.navigate(['..', 'edit'], {
      relativeTo: this.activeRoute,
      queryParams: { uri: getUri(formData.id || '') },
    });
  }

  onDeleteSuccess() {
    this.router.navigate(['..'], { relativeTo: this.activeRoute });
  }

  onCopyData(formData: Partial<S>): void {
    from(
      this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute, state: { skipForceRouteRefresh: true } }),
    ).subscribe(() => {
      this.copyData.set(formData);
      this.cdr.markForCheck();
    });
  }

  private setRouteParams() {
    const editMode = this.activeRoute.snapshot.url[0].path === 'edit';
    const dataURI = this.activeRoute.snapshot.queryParams['uri'];

    this.editMode.set(editMode);
    this.dataURI.set(dataURI);
    this.copyData.set(undefined);
  }
}
