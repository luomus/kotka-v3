import { ChangeDetectorRef, Directive, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { navigationEnd$ } from '@kotka/ui/core';
import {
  from,
  Subscription,
} from 'rxjs';
import { FormViewComponent } from '../form-view/form-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaRootDocumentMap, KotkaMainDocumentType } from '@kotka/shared/models';
import { getUri } from '@kotka/shared/utils';
import { WithLeaveConfirmComponent } from '@kotka/ui/components';

@Directive()
export class FormViewContainerComponent<
    T extends KotkaMainDocumentType = KotkaMainDocumentType,
    S extends KotkaRootDocumentMap[T] = KotkaRootDocumentMap[T],
  >
  extends WithLeaveConfirmComponent
  implements OnDestroy
{
  editMode = signal(false);
  dataURI = signal<string | undefined>(undefined);

  copyData = signal<Partial<S> | undefined>(undefined);

  @ViewChild(FormViewComponent<T, S>, { static: true })
  formViewComponent!: FormViewComponent<T, S>;

  private routeParamUpdateSub: Subscription;

  protected activeRoute = inject(ActivatedRoute);
  protected router = inject(Router);
  protected cdr = inject(ChangeDetectorRef);

  constructor() {
    super();

    this.setRouteParams();

    this.routeParamUpdateSub = navigationEnd$(this.router).subscribe(() => {
      this.setRouteParams();
    });
  }

  ngOnDestroy() {
    this.routeParamUpdateSub.unsubscribe();
  }

  override requiresConfirm(): boolean {
    return this.formViewComponent.getFormHasChanges();
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
      this.router.navigate(['..', 'add'], {
        relativeTo: this.activeRoute,
        state: { skipForceRouteRefresh: true },
      }),
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
