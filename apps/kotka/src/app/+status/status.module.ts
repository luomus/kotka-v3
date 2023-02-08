import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './status.routes';
import { CommonModule } from '@angular/common';
import { StatusComponent } from './status.component';

@NgModule({
  imports: [
    routing,
    RouterModule,
    CommonModule
  ],
  declarations: [StatusComponent]
})
export class StatusModule {}
