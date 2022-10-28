import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { Form } from '../../../../../../../libs/shared/models/src/models/LajiForm';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, DataType } from '../../../shared/services/api.service';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent {
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;

  routeParams$: Observable<{editMode: boolean, dataURI?: string}>;
  formParams$: Observable<{form: Form.SchemaForm, formData: any}>;

  constructor(
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private apiService: ApiService
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

    const datasetForm$ = this.formService.getForm('MHL.731');
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
    this.formParams$ = combineLatest([datasetForm$, formData$]).pipe(
      map(([form, formData]) => ({form, formData}))
    );
  }

  onSubmit(data: any) {
    console.log(data);
  }
}
