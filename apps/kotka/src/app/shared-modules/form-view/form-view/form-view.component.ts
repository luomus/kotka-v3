import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  TemplateRef,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObject, KotkaDocumentObjectType, LajiForm } from '@kotka/shared/models';
import { EMPTY, from, Observable, Subscription, switchMap } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { ErrorMessages } from '@kotka/api-interfaces';
import {
  FormErrorEnum,
  ErrorViewModel,
  FormState,
  FormViewFacade,
  isErrorViewModel,
  isSuccessViewModel
} from './form-view.facade';
import { filter } from 'rxjs/operators';
import { FormViewUtils } from './form-view-utils';
import { DataService } from '../../../shared/services/data.service';
import { IdService } from '../../../shared/services/id.service';
import { RoutingUtils } from '../../../shared/services/routing-utils';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade]
})
export class FormViewComponent implements OnChanges, OnDestroy {
  @Input() editMode = false;
  @Input() dataURI?: string;
  @Input() formId?: string;
  @Input() dataType?: KotkaDocumentObjectType;
  @Input() dataTypeName = '';
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;

  @Input() headerTpl?: TemplateRef<any>;
  @Input() extraSectionTpl?: TemplateRef<any>;

  vm$: Observable<FormState | ErrorViewModel>;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  @Output() formDataChange = new EventEmitter<Partial<KotkaDocumentObject|undefined>>();
  @Output() formInit = new EventEmitter<LajiFormComponent>();
  @Output() disabledChange = new EventEmitter<boolean|undefined>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  private state?: FormState;
  private subscription: Subscription = new Subscription();

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade,
    private cdr: ChangeDetectorRef
  ) {
    const params = this.getRouteParams();
    this.editMode = params.editMode;
    this.dataURI = params.dataURI;

    this.vm$ = this.formViewFacade.vm$;

    this.initSubscriptions();
  }

  ngOnChanges() {
    this.updateInputs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onFormReady() {
    if (this.lajiForm) {
      this.formInit.emit(this.lajiForm);
    }
  }
  onSubmit(data: KotkaDocumentObject) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': formData => {
        this.formViewFacade.setFormHasChanges(false);

        this.navigateToEdit(formData.id || '').subscribe(() => {
          this.lajiForm?.unBlock();
          this.notifier.showSuccess('Save success!');
          this.cdr.markForCheck();
        });
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  onDelete(data: KotkaDocumentObject) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.dataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onChange(data: Partial<KotkaDocumentObject>) {
    this.formViewFacade.setFormData(data);
  }

  onCopy(data: KotkaDocumentObject) {
    const excludedFields = this.state?.disabled ? ['owner'] : [];
    this.copyAsNew(data, excludedFields);
  }

  onSubmitAndCopy(data: KotkaDocumentObject) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': data => {
        this.formViewFacade.setFormHasChanges(false);
        this.copyAsNew(data);
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  setFormData(data: Partial<KotkaDocumentObject>) {
    this.formViewFacade.setFormData(data);
    this.formDataChange.emit(data);
  }

  getFormHasChanges(): boolean {
    return this.state?.formHasChanges || false;
  }

  dismissDisabledAlert() {
    this.formViewFacade.setDisabledAlertDismissed(true);
  }

  hideDeleteTargetInUseAlert() {
    this.formViewFacade.setShowDeleteTargetInUseAlert(false);
  }

  private delete(data: KotkaDocumentObject) {
    if (!this.dataType || !data.id) {
      return;
    }

    this.lajiForm?.block();
    this.dataService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.formViewFacade.setFormHasChanges(false);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': err => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.formViewFacade.setShowDeleteTargetInUseAlert(true);
        } else {
          this.notifier.showError('Delete failed!');
        }

        this.cdr.markForCheck();
      }
    });
  }

  private save$(data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    if (!this.dataType) {
      return EMPTY;
    }

    let save$: Observable<KotkaDocumentObject>;
    if (data.id) {
      save$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      save$ = this.dataService.create(this.dataType, data);
    }

    return save$;
  }

  private copyAsNew(data: KotkaDocumentObject, excludedFields: string[] = []) {
    this.lajiForm?.block();

    excludedFields = excludedFields.concat(this.state?.form?.excludeFromCopy || []);
    const newData = FormViewUtils.removeMetaAndExcludedFields(data, excludedFields);

    return this.navigateToAdd().pipe(
      switchMap(() => this.formViewFacade.formData$), // wait that the initial form data has loaded
      filter(formData => formData !== undefined)
    ).subscribe(() => {
      this.formViewFacade.setCopiedFormData(newData);
      this.lajiForm?.unBlock();
    });
  }

  private navigateAway() {
    this.router.navigate(['..'], { relativeTo: this.activeRoute });
  }

  private navigateToAdd(): Observable<boolean> {
    return from(this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute }));
  }

  private navigateToEdit(id: string): Observable<boolean> {
    return from(this.router.navigate(['..', 'edit'], {
      relativeTo: this.activeRoute,
      queryParams: { uri: IdService.getUri(id) }
    }));
  }

  private initSubscriptions() {
    this.subscription.add(
      RoutingUtils.navigationEnd$(this.router).subscribe(() => {
        const params = this.getRouteParams();
        if (this.editMode !== params.editMode || this.dataURI !== params.dataURI) {
          this.editMode = params.editMode;
          this.dataURI = params.dataURI;
          this.updateInputs();
        }
      })
    );

    this.subscription.add(
      this.formViewFacade.state$.subscribe(state => {
        this.state = state;
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.disabled$.subscribe(disabled => {
        this.disabledChange.emit(disabled);
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.formData$.subscribe(formData => {
        this.formDataChange.emit(formData);
        this.cdr.markForCheck();
      })
    );
  }

  private getRouteParams(): { editMode: boolean, dataURI?: string} {
    const editMode = this.activeRoute.snapshot.url[0].path === 'edit';
    const dataURI = this.activeRoute.snapshot.queryParams['uri'];
    return { editMode, dataURI };
  }

  private updateInputs() {
    if (this.formId && this.dataType) {
      this.formViewFacade.setInputs({
        formId: this.formId,
        dataType: this.dataType,
        editMode: this.editMode,
        dataURI: this.dataURI,
        augmentFormFunc: this.augmentFormFunc
      });
    }
  }
}
