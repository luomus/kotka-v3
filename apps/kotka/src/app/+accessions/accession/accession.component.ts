import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { NotFoundComponent } from '@kotka/ui/base';
import { Document, KotkaDocumentObjectType, SpecimenDataType } from '@kotka/shared/models';
import { combineLatest, Observable } from 'rxjs';
import { DocumentDataResult, DocumentDataService } from '@kotka/ui/core';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewerModalComponent } from './specimen-viewer-modal/specimen-viewer-modal.component';

interface ViewModel {
  document?: Document;
  uri?: string;
  loading: boolean;
  error?: string;
}

@Component({
  selector: 'kotka-accession',
  templateUrl: './accession.component.html',
  styleUrls: ['./accession.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NotFoundComponent,
    MainContentComponent,
    NgbAlert,
    SpinnerComponent
  ],
})
export class AccessionComponent {
  private route = inject(ActivatedRoute);
  private documentDataService = inject(DocumentDataService);
  private modalService = inject(NgbModal);

  uri$ = this.route.queryParams.pipe(map((params) => params['uri']));

  accession$: Observable<DocumentDataResult<KotkaDocumentObjectType.specimen>> =
    this.uri$.pipe(
      switchMap((uri) =>
        this.documentDataService
          .getDocumentData(KotkaDocumentObjectType.specimen, uri)
          .pipe(
            map((data) => {
              const accession: SpecimenDataType = 'accession';
              if (data.value && data.value.datatype !== accession) {
                return {
                  loading: false,
                  error: `Resource with URI ${uri} is not accession`,
                };
              } else {
                return data;
              }
            }),
          ),
      ),
      shareReplay(1),
    );

  vm$: Observable<ViewModel> = combineLatest([this.accession$]).pipe(
    map(([accession]) => {
      const loading = accession.loading;
      const error = accession.error;

      return {
        document: accession.value,
        loading,
        error,
      };
    }),
    startWith({ loading: true }),
  );

  openSpecimenViewer(uri: string) {
    const modalRef = this.modalService.open(SpecimenViewerModalComponent, { size: 'lg' });
    modalRef.componentInstance.uri = uri;
  }
}
