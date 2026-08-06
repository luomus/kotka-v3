import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { NotFoundComponent } from '@kotka/ui/base';
import { Document, KotkaDocumentObjectType, SpecimenDataType } from '@kotka/shared/models';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { ApiClient, DocumentDataResult, DocumentDataService } from '@kotka/ui/core';
import { MainContentComponent, SpinnerComponent } from '@kotka/ui/components';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewerModalComponent } from './specimen-viewer-modal/specimen-viewer-modal.component';
import { FormModalComponent } from '@kotka/ui/form-view';
import { globals } from '../../../environments/globals';
import { getId, getUri } from '@kotka/shared/utils';
import { Branch } from '@luomus/laji-schema';
import { BranchCardComponent } from './branch-card/branch-card.component';

interface BranchesResult {
  value?: Branch[];
  loading: boolean;
  error?: string;
}

interface ViewModel {
  document?: Document;
  branches?: Branch[];
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
    SpinnerComponent,
    BranchCardComponent,
  ],
})
export class AccessionComponent {
  private route = inject(ActivatedRoute);
  private apiClient = inject(ApiClient);
  private documentDataService = inject(DocumentDataService);
  private modalService = inject(NgbModal);

  private refreshBranches$ = new Subject<void>();

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

  branches$: Observable<BranchesResult> = combineLatest([
    this.uri$,
    this.refreshBranches$.pipe(startWith(undefined)),
  ]).pipe(
    switchMap(([uri]) =>
      this.apiClient
        .getAllDocuments(
          KotkaDocumentObjectType.branch,
          1000,
          undefined,
          `accessionID:${getId(uri)}`,
        )
        .pipe(
          map((value) => ({
            value,
            loading: false,
          })),
          startWith({ loading: true }),
          catchError(() => {
            return of({
              loading: false,
              error: 'An unexpected error occurred',
            });
          }),
        ),
    ),
    shareReplay(1),
  );

  vm$: Observable<ViewModel> = combineLatest([
    this.accession$,
    this.branches$,
  ]).pipe(
    map(([accession, branches]) => {
      const loading = accession.loading || branches.loading;
      const error = accession.error || branches.error;

      return {
        document: accession.value,
        branches: branches.value,
        loading,
        error,
      };
    }),
    startWith({ loading: true }),
  );

  openSpecimenViewer(uri: string) {
    const modalRef = this.modalService.open(SpecimenViewerModalComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.uri = uri;
  }

  openBranchForm(uri: string, branch?: Branch) {
    const editMode = !!branch;
    const modalRef = this.modalService.open(FormModalComponent, {
      backdrop: 'static',
      size: 'lg',
    });

    modalRef.componentInstance.formId = globals.branchFormId;
    modalRef.componentInstance.dataType = KotkaDocumentObjectType.branch;
    modalRef.componentInstance.editMode = editMode;
    modalRef.componentInstance.title = editMode ? 'Edit Branch' : 'Add Branch';

    if (editMode) {
      if (!branch.id) {
        throw new Error('Branch is missing an id');
      }
      modalRef.componentInstance.dataURI = getUri(branch.id);
      modalRef.componentInstance.formData = branch;
    } else {
      modalRef.componentInstance.formData = {
        accessionID: getId(uri)
      };
    }

    modalRef.closed.subscribe(() => {
      this.refreshBranches$.next();
    });
  }
}
