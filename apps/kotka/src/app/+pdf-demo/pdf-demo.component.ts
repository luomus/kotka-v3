import { ChangeDetectionStrategy, Component, ViewEncapsulation, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, share, switchMap } from 'rxjs/operators';
import { DataService } from '../shared/services/data.service';
import { FormViewUtils } from '../shared-modules/form-view/form-view/form-view-utils';
import {
  asSpecimenTransaction,
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  LajiOrganization
} from '@kotka/shared/models';
import { ApiClient } from '../shared/services/api-services/api-client';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'kotka-pdf-demo-component',
  templateUrl: './pdf-demo.component.html',
  styleUrls: ['./pdf-demo.component.scss', '../../assets/pdf-styles.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PdfDemoComponent {
  data$: Observable<KotkaDocumentObject>;
  ownerOrganization$: Observable<LajiOrganization|undefined>;

  asSpecimenTransaction = asSpecimenTransaction;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private apiClient: ApiClient
  ) {
    const id$ = this.route.queryParams.pipe(
      map((p) => FormViewUtils.getIdFromDataURI(p['uri']))
    );
    this.data$ = id$.pipe(switchMap(id => (
      this.dataService.getById(KotkaDocumentObjectType.transaction, id)
    )), share());
    this.ownerOrganization$ = this.data$.pipe(switchMap(data => (
      data.owner ? this.apiClient.getOrganization(data.owner) : of(undefined)
    )));
  }
}
