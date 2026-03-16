import { ChangeDetectorRef, Directive, HostListener, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ComponentCanDeactivate, DialogService, navigationEnd$ } from '@kotka/ui/core';
import { from, Observable, of, Subscription } from 'rxjs';
import { FormViewComponent } from './form-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObjectMap, KotkaDocumentObjectType } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';

@Directive()
export class FormViewContainerComponent<
  T extends KotkaDocumentObjectType = KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T]
> implements OnDestroy, ComponentCanDeactivate {
  editMode = signal(false);
  dataURI = signal<string | undefined>(undefined);

  copyData = signal<Partial<S> | undefined>(undefined);

  @ViewChild(FormViewComponent<T, S>, { static: true }) formViewComponent!: FormViewComponent<T, S>;

  private routeParamUpdateSub: Subscription;

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

  @HostListener('window:beforeunload')
  preventLeave(): boolean {
    return !this.formViewComponent.getFormHasChanges();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.formViewComponent.getFormHasChanges()) {
      return of(true);
    }

    return this.dialogService.confirm(
      'Are you sure you want to leave and discard unsaved changes?',
    );
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
      this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute }),
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
