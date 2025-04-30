import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { KotkaDocumentObjectType, Document } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { FormViewComponent } from '@kotka/ui/form-view';
import { DialogService, navigationEnd$, UserService } from '@kotka/ui/services';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

type UrlDataType = 'botany'|'zoo'|'palaeontology'|'accession'|'culture';
type DataType = 'botanyspecimen'|'zoospecimen'|'palaeontology'|'accession'|'culture';

interface SpecimenFormDocument extends Document {
  namespaceID?: string;
  objectID?: string;
}

const urlToDataTypeMap: Record<UrlDataType, DataType> = {
  botany: 'botanyspecimen',
  zoo: 'zoospecimen',
  palaeontology: 'palaeontology',
  accession: 'accession',
  culture: 'culture',
};

@Component({
  selector: 'kotka-specimen-form',
  templateUrl: './specimen-form.component.html',
  styleUrls: ['./specimen-form.component.scss'],
  imports: [FormViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenFormComponent extends FormViewContainerComponent implements OnInit, OnDestroy {
  formId = globals.specimenFormId;
  dataType: KotkaDocumentObjectType.specimen = KotkaDocumentObjectType.specimen;

  prefilledFormData?: Partial<Document>;

  processFormDataBeforeSaveFunc = this.processFormDataBeforeSave.bind(this);

  private routerSub?: Subscription;

  constructor(
    dialogService: DialogService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    super(dialogService);
    this.prefilledFormData = this.getPrefilledFormDataFromCurrentUrl();
  }

  ngOnInit() {
    this.routerSub = navigationEnd$(this.router).subscribe(() => {
      this.prefilledFormData = this.getPrefilledFormDataFromCurrentUrl();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  private getPrefilledFormDataFromCurrentUrl(): Partial<Document>|undefined {
    const dataType = this.getDataTypeFromCurrentUrl();

    if (dataType) {
      return { datatype: dataType };
    }

    return undefined;
  }

  private getDataTypeFromCurrentUrl(): DataType|undefined {
    const urlParts: string[] = this.router.routerState.snapshot.url.split('/').filter(part => !!part);
    const firstPart = urlParts[0];

    if (Object.keys(urlToDataTypeMap).includes(firstPart)) {
      return urlToDataTypeMap[firstPart as UrlDataType];
    }

    return undefined;
  }

  private processFormDataBeforeSave(data: SpecimenFormDocument): Observable<Document> {
    return this.userService.getCurrentLoggedInUser().pipe(
      map(user => {
        if (data.namespaceID && data.objectID) {
          if (!data.namespaceID.includes(":")) {
            const defaultPrefix = user.defaultQNamePrefix || "luomus";
            data.namespaceID = defaultPrefix + ":" + data.namespaceID;
          }
          data.id = data.namespaceID + "." + data.objectID;
        }

        delete data.namespaceID;
        delete data.objectID;

        return data;
      })
    );
  }
}
