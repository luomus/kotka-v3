import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routing } from './organizations.routes';
import { OrganizationTableComponent } from './organization-table/organization-table.component';
import { KotkaUiMainContentModule } from '@kotka/ui/main-content';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { FormViewModule } from '../shared-modules/form-view/form-view.module';
import { SharedModule } from '../shared/shared.module';
import { OrganizationVersionHistoryComponent } from './organization-version-history/organization-version-history.component';
import { PipesModule } from '@kotka/ui/pipes';
import { FormsModule } from '@angular/forms';
import { DocumentDatatableComponent } from '@kotka/ui/document-datatable';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule,
    SharedModule,
    KotkaUiMainContentModule,
    FormViewModule,
    PipesModule,
    FormsModule,
    DocumentDatatableComponent,
  ],
  declarations: [
    OrganizationTableComponent,
    OrganizationFormComponent,
    OrganizationVersionHistoryComponent,
  ],
})
export class OrganizationsModule {}
