import { ComponentRef, Type, Injector } from '@angular/core';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import {
  EmbeddedComponentData,
  EmbedOptions,
  LajiFormComponentEmbedderService,
} from './laji-form-component-embedder.service';

export class LajiFormEmbedService {
  private componentEmbedder: LajiFormComponentEmbedderService;

  private componentData: EmbeddedComponentData[] = [];

  private mutationObserver!: MutationObserver;

  constructor(
    private injector: Injector,
    private lajiForm: LajiFormComponent,
  ) {
    this.componentEmbedder = this.injector.get(
      LajiFormComponentEmbedderService,
    );

    this.init();
  }

  init() {
    this.mutationObserver = new MutationObserver(() => {
      this.componentData.forEach((d) => {
        this.componentEmbedder.updateAfterDomChange(d);
      });
    });

    this.mutationObserver.observe(
      this.lajiForm.lajiFormRoot.nativeElement,
      { childList: true, subtree: true }
    );

    this.lajiForm.formDestroy.subscribe(() => {
      this.mutationObserver.disconnect();
      this.componentData.forEach((d) => {
        d.componentRef.destroy();
      });
    });
  }

  embedComponent<T>(
    componentType: Type<T>,
    options: EmbedOptions,
  ): ComponentRef<T> {
    const d = this.componentEmbedder.embedComponent(componentType, options);
    this.componentData.push(d);
    return d.componentRef;
  }
}
