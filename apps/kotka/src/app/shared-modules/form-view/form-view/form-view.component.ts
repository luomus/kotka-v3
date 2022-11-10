import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { LajiForm } from '@kotka/shared/models';
import { combineLatest, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataObject, ApiService, DataType } from '../../../shared/services/api.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent implements OnChanges {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;

  routeParams$: Observable<{editMode: boolean, dataURI?: string}>;
  formId$: ReplaySubject<string> = new ReplaySubject<string>();
  formParams$: Observable<{form: LajiForm.SchemaForm, formData?: DataObject}>;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor(
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private apiService: ApiService,
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
    const formData$ = this.routeParams$.pipe(
      switchMap(params => {
        if (params.dataURI && this.dataType) {
          const uriParts = params.dataURI.split('/');
          const id = uriParts.pop() as string;
          return this.apiService.getById(this.dataType, id);
        } else {
          return of(undefined);
        }
      })
    );
    this.formParams$ = combineLatest([form$, formData$]).pipe(
      map(([form, formData]) => ({form, formData}))
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] && this.formId) {
      this.formId$.next(this.formId);
    }
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
    saveData$.subscribe(() => {
      this.lajiForm?.unBlock();
      this.notifier.showSuccess('Save success!');
      this.cdr.markForCheck();
    });
  }
}
