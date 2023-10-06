import {
  ChangeDetectionStrategy,
  Component, EventEmitter,
  Input,
  OnChanges, Output,
  SimpleChanges,
} from '@angular/core';
import {
  VersionHistoryErrorEnum,
  VersionHistoryViewFacade,
  ErrorViewModel,
  SuccessViewModel,
  isErrorViewModel,
  isSuccessViewModel,
  isVersionListViewModel,
  isVersionViewModel,
  isVersionComparisonViewModel
} from './version-history-view.facade';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { KotkaDocumentType } from '@kotka/api-interfaces';
import { KotkaDocumentObject } from '@kotka/shared/models';
import { LajiFormComponent } from '@kotka/ui/laji-form';

@Component({
  selector: 'kotka-version-history-view',
  templateUrl: './version-history-view.component.html',
  styleUrls: ['./version-history-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VersionHistoryViewFacade]
})
export class VersionHistoryViewComponent implements OnChanges {
  @Input() formId?: string;
  @Input() dataType?: KotkaDocumentType;
  @Input() dataTypeName?: string;

  vm$: Observable<SuccessViewModel | ErrorViewModel>;

  visibleDataTypeName?: string;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;
  isVersionListViewModel = isVersionListViewModel;
  isVersionViewModel = isVersionViewModel;
  isVersionComparisonViewModel = isVersionComparisonViewModel;

  versionHistoryErrorEnum = VersionHistoryErrorEnum;

  @Output() formInit = new EventEmitter<{ lajiForm: LajiFormComponent; formData: KotkaDocumentObject }>();

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
