import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormViewComponent } from './form-view/form-view.component';
import { KotkaUiMainContentModule } from '../../../../../../libs/kotka/ui/main-content/src';
import { KotkaUiLajiFormModule } from '@kotka/ui/laji-form';
import { SharedModule } from '../../shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { ViewerModule } from '../viewer/viewer.module';
import { VersionHistoryViewComponent } from './version-history-view/version-history-view.component';
import { VersionComparisonComponent } from './version-history-view/version-comparison/version-comparison.component';
import { RouterModule } from '@angular/router';
import { VersionListComponent } from './version-history-view/version-list/version-list.component';

@NgModule({
  declarations: [
    FormViewComponent,
    VersionHistoryViewComponent,
    VersionComparisonComponent,
    VersionListComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiLajiFormModule,
    NgbAlertModule,
    ViewerModule,
    RouterModule,
  ],
  exports: [FormViewComponent, VersionHistoryViewComponent],
})
export class FormViewModule {}
