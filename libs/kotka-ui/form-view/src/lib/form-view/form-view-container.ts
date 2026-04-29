import { ChangeDetectorRef, Directive, HostListener, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { ComponentCanDeactivate, DialogService, navigationEnd$ } from '@kotka/ui/core';
import { from, Observable, of, Subscription } from 'rxjs';
import { FormViewComponent } from './form-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObjectMap, KotkaDocumentObjectType } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';
import { PrefilledFormData } from '../models';

@Directive()
export class FormViewContainerComponent<
  T extends KotkaDocumentObjectType = KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T]
> implements OnDestroy, ComponentCanDeactivate {
  editMode = signal(false);
  dataURI = signal<string | undefined>(undefined);

  copyData = signal<PrefilledFormData<S> | undefined>(undefined);

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
      this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute, state: { skipForceRouteRefresh: true } }),
    ).subscribe(() => {
      this.copyData.set({ data: formData, hasChanges: true });
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
