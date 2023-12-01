import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  VersionHistoryErrorEnum,
  VersionHistoryViewFacade,
  ErrorViewModel,
  VersionHistoryState,
  isErrorViewModel,
  isSuccessViewModel,
  VersionHistoryViewEnum
} from './version-history-view.facade';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { KotkaDocumentObject, KotkaDocumentObjectType } from '@kotka/shared/models';
import { isEqual } from 'lodash';
import { Utils } from '../../../shared/services/utils';

@Component({
  selector: 'kotka-version-history-view',
  templateUrl: './version-history-view.component.html',
  styleUrls: ['./version-history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VersionHistoryViewFacade]
})
export class VersionHistoryViewComponent implements OnChanges, OnDestroy {
  @Input() formId?: string;
  @Input() dataType?: KotkaDocumentObjectType;
  @Input() dataTypeName = '';

  dataURI?: string;
  version?: number;
  versions?: number[];
  view?: VersionHistoryViewEnum;

  vm$: Observable<VersionHistoryState| ErrorViewModel>;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  versionHistoryViewEnum = VersionHistoryViewEnum;
  versionHistoryErrorEnum = VersionHistoryErrorEnum;

  @Output() formInit = new EventEmitter<{ lajiForm: LajiFormComponent; formData: KotkaDocumentObject }>();

  private routeSub: Subscription;

  constructor(
    private versionHistoryFacade: VersionHistoryViewFacade,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
    this.setRouteParamsIfChanged();

    this.routeSub = Utils.navigationEnd$(this.router).subscribe(() => {
      if (this.setRouteParamsIfChanged()) {
        this.updateInputs();
      }
    });

    this.vm$ = this.versionHistoryFacade.vm$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType']) {
      this.updateInputs();
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  onCompareVersionsClick(versions: number[]) {
    this.router.navigate([], { queryParams: { version: versions }, queryParamsHandling: 'merge' });
  }

  private updateInputs() {
    if (this.formId && this.dataType) {
      this.versionHistoryFacade.setInputs({
        formId: this.formId,
        dataType: this.dataType,
        dataURI: this.dataURI,
        version: this.version,
        versions: this.versions,
        view: this.view
      });
    }
  }

  private setRouteParamsIfChanged(): boolean {
    const dataURI = this.activeRoute.snapshot.queryParams['uri'];
    const versionParam = this.activeRoute.snapshot.queryParams['version'];

    let version, versions;
    if (versionParam) {
      if (Array.isArray(versionParam)) {
        version = undefined;
        versions = versionParam.map(value => parseInt(value, 10)).filter(value => !!value);
      } else {
        version = parseInt(versionParam, 10) || undefined;
        versions = undefined;
      }
    }

    const view = version !== undefined ? VersionHistoryViewEnum.version : (
      versions ? VersionHistoryViewEnum.versionComparison : VersionHistoryViewEnum.versionList
    );

    if (this.dataURI !== dataURI || this.version !== version || !isEqual(this.versions, versions) || this.view !== view) {
      this.dataURI = dataURI;
      this.version = version;
      this.versions = versions;
      this.view = view;

      return true;
    }

    return false;
  }
}
