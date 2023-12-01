import {
  Directive,
  HostListener,
  ViewChild
} from '@angular/core';
import { ComponentCanDeactivate } from '../../../shared/services/guards/component-can-deactivate.guard';
import { Observable, of } from 'rxjs';
import { DialogService } from '../../../shared/services/dialog.service';
import { FormViewComponent } from './form-view.component';

@Directive()
export class FormViewContainerComponent implements ComponentCanDeactivate {
  @ViewChild(FormViewComponent, { static: true }) formViewComponent?: FormViewComponent;

  constructor(
    protected dialogService: DialogService
  ) {}

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.formViewComponent?.getFormHasChanges()) {
      $event.returnValue = false;
    }
  }

  canDeactivate(): Observable<boolean> {
    if (!this.formViewComponent?.getFormHasChanges()) {
      return of(true);
    }

    return this.dialogService.confirm('Are you sure you want to leave and discard unsaved changes?');
  }
}
