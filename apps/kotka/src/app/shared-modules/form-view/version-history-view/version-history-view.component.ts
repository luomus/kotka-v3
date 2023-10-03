import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DataType } from '../../../shared/services/api-services/data.service';
import {
  isVersionComparisonViewData,
  isVersionListViewData,
  VersionHistoryErrorEnum,
  VersionHistoryViewFacade,
  ErrorViewModel,
  SuccessViewModel,
  isErrorViewModel,
  isSuccessViewModel
} from './version-history-view.facade';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'kotka-version-history-view',
  templateUrl: './version-history-view.component.html',
  styleUrls: ['./version-history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VersionHistoryViewFacade]
})
export class VersionHistoryViewComponent implements OnChanges {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;

  vm$: Observable<SuccessViewModel | ErrorViewModel>;

  visibleDataTypeName?: string;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;
  isVersionListViewData = isVersionListViewData;
  isVersionComparisonViewData = isVersionComparisonViewData;

  versionHistoryErrorEnum = VersionHistoryErrorEnum;

  constructor(
    private versionHistoryFacade: VersionHistoryViewFacade,
    private router: Router
  ) {
    this.vm$ = this.versionHistoryFacade.vm$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType']) {
      if (this.formId && this.dataType) {
        this.versionHistoryFacade.setInputs({
          formId: this.formId,
          dataType: this.dataType
        });
      }
    }

    this.visibleDataTypeName = this.dataTypeName || this.dataType;
  }

  onCompareVersionsClick(versions: number[]) {
    this.router.navigate([], { queryParams: { version: versions }, queryParamsHandling: 'merge' });
  }
}
