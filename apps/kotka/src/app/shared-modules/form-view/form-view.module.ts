import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormViewComponent } from './form-view/form-view.component';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { KotkaUiLajiFormModule } from '@kotka/ui/laji-form';
import { SharedModule } from '../../shared/shared.module';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { VersionHistoryViewComponent } from './version-history-view/version-history-view.component';
import { VersionComparisonComponent } from './version-history-view/version-comparison/version-comparison.component';
import { RouterModule } from '@angular/router';
import { VersionListComponent } from './version-history-view/version-list/version-list.component';
import { VersionComponent } from './version-history-view/version/version.component';
import { KotkaUiViewerModule } from '@kotka/ui/viewer';
import { MetaFieldsComponent } from './meta-fields/meta-fields.component';
import { PipesModule } from '@kotka/ui/pipes';

@NgModule({
  declarations: [
    FormViewComponent,
    VersionHistoryViewComponent,
    VersionComparisonComponent,
    VersionListComponent,
    VersionComponent,
    MetaFieldsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    KotkaUiLajiFormModule,
    KotkaUiViewerModule,
    NgbAlertModule,
    RouterModule,
    PipesModule,
  ],
  exports: [FormViewComponent, VersionHistoryViewComponent],
})
export class FormViewModule {}
