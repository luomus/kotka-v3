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

@NgModule({
  declarations: [
    FormViewComponent,
    VersionHistoryViewComponent,
    VersionComparisonComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiLajiFormModule,
    NgbAlertModule,
    ViewerModule,
  ],
  exports: [
    FormViewComponent,
    VersionHistoryViewComponent
  ],
})
export class FormViewModule {}
