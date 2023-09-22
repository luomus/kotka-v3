import {
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Inject,
  Injectable,
  Injector,
  Renderer2, RendererFactory2,
  TemplateRef, Type
} from '@angular/core';
import { LajiFormEmbedComponent } from './laji-form-embed-component.interface';
import { DOCUMENT } from '@angular/common';
import { of, Subscription } from 'rxjs';

export type RelativePosition = 'firstChild'|'nextSibling'|'parentNextSibling';

export interface EmbedOptions {
  anchorClassName: string;
  positionToAnchor: RelativePosition;
}

export interface EmbeddedComponentData {
  componentRef: ComponentRef<any>;
  options: EmbedOptions;
  template: TemplateRef<any>;
  templateContext?: any;
  anchorElem?: HTMLElement|null;
  oldElem?: HTMLElement|null;
  contextSubscription?: Subscription;
}

@Injectable()
export class LajiFormComponentEmbedderService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  embedComponent<T extends LajiFormEmbedComponent>(componentType: Type<T>, options: EmbedOptions): EmbeddedComponentData {
    const componentRef = this.createComponentFromType(componentType);
    const template = componentRef.instance.template;
    const context$ = componentRef.instance.templateContext$ || of({});

    const dataItem: EmbeddedComponentData = { componentRef, options, template };

    dataItem.contextSubscription = context$.subscribe((context) => {
      dataItem.templateContext = context;
      this.updateEmbeddedTemplate(dataItem);
    });

    return dataItem;
  }

  updateAfterDomChange(data: EmbeddedComponentData) {
    if (data.anchorElem && this.document.body.contains(data.anchorElem)) {
      return;
    } else {
      data.anchorElem = undefined;
    }
    this.updateEmbeddedTemplate(data);
  }

  private updateEmbeddedTemplate(data: EmbeddedComponentData) {
    if (data.oldElem) {
      this.removeElement(data.oldElem);
      data.oldElem = undefined;
    }

    if (!data.templateContext) {
      return;
    }

    const anchorElem: HTMLElement|null|undefined = this.document.getElementsByClassName(data.options.anchorClassName)?.[0] as HTMLElement|null|undefined;
    if (!anchorElem) {
      return;
    }
    data.anchorElem = anchorElem;

    const newElem = this.createElementFromTemplate(data.template, data.templateContext);
    this.appendElement(anchorElem, newElem, data.options.positionToAnchor);
    data.oldElem = newElem;
    data.componentRef.instance.onTemplateEmbed?.();
  }

  private createElementFromTemplate<T>(tpl: TemplateRef<T>, context: T): HTMLElement {
    const view = tpl.createEmbeddedView(context);
    view.detectChanges();
    const newElem = view.rootNodes[0].cloneNode(true);
    view.destroy();
    return newElem;
  }

  private removeElement(elem: HTMLElement) {
    this.renderer.removeChild(elem.parentElement, elem);
  }

  private appendElement(anchorElem: HTMLElement, newElem: HTMLElement, positionToAnchor: RelativePosition) {
    if (positionToAnchor === 'firstChild') {
      this.renderer.insertBefore(anchorElem, newElem, anchorElem.firstChild);
    } else if (positionToAnchor === 'nextSibling' || positionToAnchor === 'parentNextSibling') {
      let parentElem = anchorElem.parentElement;

      if (positionToAnchor === 'parentNextSibling') {
        anchorElem = parentElem as HTMLElement;
        parentElem = parentElem?.parentElement as HTMLElement;
      }

      this.renderer.insertBefore(parentElem, newElem, anchorElem.nextSibling);
    }
  }

  private createComponentFromType<T>(componentType: Type<T>): ComponentRef<T> {
    const environmentInjector = this.environmentInjector;
    const elementInjector = Injector.create({
      providers: [],
      parent: this.injector,
    });
    return createComponent(componentType, {
      environmentInjector,
      elementInjector,
    });
  }
}
