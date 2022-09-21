import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './datasets.routes';
import { DatasetsComponent } from './datasets.component';

@NgModule({
  imports: [
    routing,
    RouterModule
  ],
  declarations: [
    DatasetsComponent
  ]
})
export class DatasetsModule {}
