import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewerComponent } from './viewer/viewer.component';
import { ViewerFieldsetComponent } from './viewer/components/viewer-fieldset.component';
import { ViewerCollectionComponent } from './viewer/components/viewer-collection.component';
import { ArrayIndexRangePipe } from './pipes/array-index-range.pipe';
import { ViewerMultilangComponent } from './viewer/components/viewer-multilang.component';
import { ViewerFieldComponent } from './viewer/components/viewer-field.component';
import { ViewerFieldValueComponent } from './viewer/components/viewer-field-value.component';
import { ViewerFieldValueArrayComponent } from './viewer/components/viewer-field-value-array.component';
import { ViewerFieldsetFieldComponent } from './viewer/components/viewer-fieldset-field.component';
import { PipesModule } from '@kotka/pipes';

@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [
    ViewerComponent,
    ViewerFieldsetComponent,
    ViewerFieldsetFieldComponent,
    ViewerCollectionComponent,
    ViewerMultilangComponent,
    ViewerFieldComponent,
    ViewerFieldValueComponent,
    ViewerFieldValueArrayComponent,
    ArrayIndexRangePipe
  ],
  exports: [ViewerComponent]
})
export class KotkaUiViewerModule {}
