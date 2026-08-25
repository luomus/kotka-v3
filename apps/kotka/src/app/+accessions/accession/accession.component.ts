import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { NotFoundComponent } from '@kotka/ui/base';
import {
  Document,
  KotkaDocumentType,
  SpecimenDataType,
} from '@kotka/shared/models';
import { combineLatest, Observable, of, Subject, throwError } from 'rxjs';
import {
  ApiClient,
  DocumentDataResult,
  DocumentDataService,
  UserService,
} from '@kotka/ui/core';
import {
  MainContentComponent,
  MainContentHeaderDirective,
  SpinnerComponent,
  WithLeaveConfirmComponent,
} from '@kotka/ui/components';
import { NgbAlert, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewerModalComponent } from './specimen-viewer-modal/specimen-viewer-modal.component';
import { FormModalComponent } from '@kotka/ui/form-view';
import { globals } from '../../../environments/globals';
import {
  allowDeleteForUser,
  allowEditForUser,
  getId,
} from '@kotka/shared/utils';
import { Branch, Person } from '@luomus/laji-schema';
import { BranchTableComponent } from './branch-table/branch-table.component';

interface BranchesResult {
  value?: Branch[];
  loading: boolean;
  error?: string;
}

interface ViewModel {
  title?: string;
  document?: Document;
  branches?: Branch[];
  allowEdit?: boolean;
  defaultBranchData?: Partial<Branch>;
  loading: boolean;
  error?: string;
  user?: Person;
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
    MainContentHeaderDirective,
    NgbAlert,
    SpinnerComponent,
    BranchTableComponent,
  ],
})
export class AccessionComponent
  extends WithLeaveConfirmComponent
  implements OnDestroy
{
  private route = inject(ActivatedRoute);
  private apiClient = inject(ApiClient);
  private documentDataService = inject(DocumentDataService);
  private userService = inject(UserService);
  private modalService = inject(NgbModal);

  showDepleted = true;

  uri$ = this.route.queryParams.pipe(map((params) => params['uri']));
  vm$: Observable<ViewModel>;

  private activeModalRef?: NgbModalRef;
  private refreshBranches$ = new Subject<void>();

  constructor() {
    super();

    const accession$: Observable<
      DocumentDataResult<KotkaDocumentType.specimen>
    > = this.uri$.pipe(
      switchMap((uri) =>
        this.documentDataService
          .getDocumentData(KotkaDocumentType.specimen, uri)
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

    const branches$: Observable<BranchesResult> = combineLatest([
      this.uri$,
      this.refreshBranches$.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([uri]) =>
        this.apiClient
          .getAllDocuments(
            KotkaDocumentType.branch,
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

    this.vm$ = combineLatest([
      accession$,
      branches$,
      this.userService.getCurrentLoggedInUser(),
    ]).pipe(
      map(([accession, branches, user]) => {
        const loading = accession.loading || branches.loading;
        const error = accession.error || branches.error;
        const document = accession.value;

        return {
          title: accession.title,
          document,
          branches: branches.value,
          allowEdit: document ? allowEditForUser(document, user) : false,
          defaultBranchData: document
            ? { accessionID: document.id }
            : undefined,
          loading,
          error,
          user
        };
      }),
      startWith({ loading: true }),
    );
  }

  ngOnDestroy() {
    this.activeModalRef?.close();
  }

  override requiresConfirm(): boolean {
    const modalInstance = this.activeModalRef?.componentInstance;
    if (modalInstance instanceof FormModalComponent) {
      return modalInstance.formState().formHasChanges || false;
    }
    return false;
  }

  openSpecimenViewer(uri: string) {
    const modalRef = this.modalService.open(SpecimenViewerModalComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.uri = uri;

    this.activeModalRef = modalRef;
  }

  openBranchForm(
    editMode: boolean,
    allowEdit?: boolean,
    user?: Person,
    formData?: Partial<Branch>,
  ) {
    const modalRef = this.modalService.open(FormModalComponent, {
      backdrop: 'static',
      size: 'lg',
    });

    modalRef.componentInstance.formId = globals.branchFormId;
    modalRef.componentInstance.editMode = editMode;
    modalRef.componentInstance.allowEdit = allowEdit;
    modalRef.componentInstance.allowDelete = formData && user && allowDeleteForUser(formData, user);
    modalRef.componentInstance.title = editMode ? 'Edit Branch' : 'Add Branch';
    modalRef.componentInstance.save$ = (data: Branch) => {
      if (editMode) {
        if (!data.id) {
          return throwError(() => new Error('Branch is missing an id'));
        }
        return this.apiClient.updateDocument(
          KotkaDocumentType.branch,
          data.id,
          data,
        );
      } else {
        return this.apiClient.createDocument(KotkaDocumentType.branch, data);
      }
    };
    modalRef.componentInstance.delete$ = (data: Partial<Branch>) => {
      if (!data.id) {
        return throwError(() => new Error('Branch is missing an id'));
      }
      return this.apiClient.deleteDocument(KotkaDocumentType.branch, data.id);
    };

    modalRef.componentInstance.formData = formData;

    modalRef.closed.subscribe(() => {
      this.refreshBranches$.next();
    });

    this.activeModalRef = modalRef;
  }
}
