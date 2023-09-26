import { ComponentRef, Type } from '@angular/core';
import { LajiFormEmbedComponent } from './laji-form-embed-component.interface';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { Subscription, take } from 'rxjs';
import {
  EmbeddedComponentData,
  EmbedOptions,
  LajiFormComponentEmbedderService
} from './laji-form-component-embedder.service';
import { EventListenerData, LajiFormEventListenerEmbedderService } from './laji-form-event-listener-embedder.service';

export class LajiFormEmbedService {
  private componentData: EmbeddedComponentData[] = [];
  private eventListenerData: EventListenerData[] = [];

  private formChangeSubscription?: Subscription;

  constructor(
    private componentEmbedder: LajiFormComponentEmbedderService,
    private eventListenerEmbedder: LajiFormEventListenerEmbedderService,
    private lajiForm: LajiFormComponent
  ) {
    this.init();
  }

  init() {
    this.formChangeSubscription = this.lajiForm.formChange.subscribe(() => {
      this.componentData.forEach(d => {
        this.componentEmbedder.updateAfterDomChange(d);
      });
      this.eventListenerData.forEach(d => {
        this.eventListenerEmbedder.updateAfterDomChange(d);
      });
    });

    this.lajiForm.formDestroy.pipe(take(1)).subscribe(() => {
      this.formChangeSubscription?.unsubscribe();
      this.componentData.forEach(d => {
        d.contextSubscription?.unsubscribe();
      });
    });
  }

  embedComponent<T extends LajiFormEmbedComponent>(componentType: Type<T>, options: EmbedOptions): ComponentRef<T> {
    const d = this.componentEmbedder.embedComponent(componentType, options);
    this.componentData.push(d);
    return d.componentRef;
  }

  addOnClickEventListener(id: string, func: (event: MouseEvent) => void) {
    const d = this.eventListenerEmbedder.addOnClickEventListener(id, func);
    this.eventListenerData.push(d);
  }
}
