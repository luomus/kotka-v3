import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import { combineLatest, Observable, of, ReplaySubject, Subscription, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataObject, ApiService, DataType } from '../../../shared/services/api.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/user.service';
import { FormApiClient } from '../../../shared/services/form-api-client';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent implements OnChanges, OnInit, OnDestroy {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<DataObject>;

  routeParams$: Observable<{editMode: boolean, dataURI?: string}>;
  formId$: ReplaySubject<string> = new ReplaySubject<string>();
  formParams$: Observable<{form: LajiForm.SchemaForm, formData?: Partial<DataObject>}>;

  formContext: Record<string, any> = {};

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  private formData = new ReplaySubject<DataObject|undefined>(1);
  private routeSub?: Subscription;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.routeParams$ = combineLatest([
      this.activeRoute.url.pipe(
        map(url => url[0].path === 'edit')
      ),
      this.activeRoute.queryParams.pipe(
        map(queryParams => queryParams['uri'])
      )
    ]).pipe(
      map(([editMode, dataURI]) => ({editMode, dataURI}))
    );

    const form$ = this.formId$.pipe(
      switchMap(formId => this.formService.getForm(formId))
    );

    this.formParams$ = combineLatest([form$, this.formData, this.userService.user$]).pipe(
      map(([form, data, user]) => {
        form.uiSchemaContext = {
          userName: this.userService.formatUserName(user?.fullName),
          ...form.uiSchemaContext
        };

        let formData: Partial<DataObject>|undefined = data;
        if (!formData && this.getInitialFormDataFunc && user) {
          formData = this.getInitialFormDataFunc(user);
        }

        return {form, formData};
      })
    );
  }

  ngOnInit() {
    this.routeSub = this.routeParams$.pipe(
      switchMap(params => {
        if (params.dataURI && this.dataType) {
          const uriParts = params.dataURI.split('/');
          const id = uriParts.pop() as string;
          return this.apiService.getById(this.dataType, id);
        } else {
          return of(undefined);
        }
      })
    ).subscribe(
      formData => this.formData.next(formData)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] && this.formId) {
      this.formId$.next(this.formId);
    }
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  onSubmit(data: DataObject) {
    if (!this.dataType) {
      return;
    }

    let saveData$: Observable<DataObject>;
    if (data.id) {
      saveData$ = this.apiService.update(this.dataType, data.id, data);
    } else {
      saveData$ = this.apiService.create(this.dataType, data);
    }

    this.lajiForm?.block();
    saveData$.subscribe({
      'next': formData => {
        this.formData.next(formData);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Save success!');
        this.cdr.markForCheck();
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  onDelete(data: DataObject) {
    if (!this.dataType) {
      return;
    }
    if (!data.id) {
      this.navigateAway();
      return;
    }

    this.lajiForm?.block();
    this.apiService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Delete failed!');
        this.cdr.markForCheck();
      }
    });
  }

  private navigateAway() {
    this.router.navigate(['..'], {relativeTo: this.activeRoute});
  }
}
