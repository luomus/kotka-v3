import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../shared/services/form.service';
import { Form } from '../../../../../../libs/shared/models/src/models/LajiForm';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent {
  routeParams$: Observable<{editMode: boolean, datasetURI?: string}>;
  formParams$: Observable<{form: Form.SchemaForm, formData: any}>;

  constructor(
    private activeRoute: ActivatedRoute,
    private formService: FormService
  ) {
    this.routeParams$ = combineLatest([
      this.activeRoute.url.pipe(
        map(url => url[0].path === 'edit')
      ),
      this.activeRoute.queryParams.pipe(
        map(queryParams => queryParams['uri'])
      )
    ]).pipe(
      map(([editMode, datasetURI]) => {
        return {
          editMode,
          datasetURI
        }
      })
    );

    const datasetForm$ = this.formService.getForm('MHL.731');
    const formData$ = this.routeParams$.pipe(
      switchMap(params => {
        if (params.datasetURI) {
          return of({
            datasetName: {en: 'dataset 1'}, personsResponsible: 'Kotka Kokoelma', description: {fi: 'kuvaus'}
          });
        } else {
          return of({});
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
