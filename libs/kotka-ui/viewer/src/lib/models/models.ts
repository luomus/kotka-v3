import { TemplateRef } from '@angular/core';
import { LajiForm } from '@kotka/shared/models';

export interface ViewerField extends LajiForm.Field {
  collectionLabelTemplate?: TemplateRef<unknown>;
}
