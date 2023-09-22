import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface LajiFormEmbedComponent {
  template: TemplateRef<any>;
  templateContext$?: Observable<any>;

  onTemplateEmbed?: () => void;
}
