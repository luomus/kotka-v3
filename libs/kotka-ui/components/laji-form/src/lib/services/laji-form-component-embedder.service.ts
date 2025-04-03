import {
  ApplicationRef,
  ComponentRef,
  Inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  Type,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ComponentService } from '@kotka/ui/services';

export type RelativePosition =
  | 'firstChild'
  | 'nextSibling'
  | 'parentNextSibling';

export interface EmbedOptions {
  anchorClassName: string;
  positionToAnchor: RelativePosition;
}

export interface EmbeddedComponentData {
  componentRef: ComponentRef<any>;
  options: EmbedOptions;
  elem: HTMLElement;
}

@Injectable({
  providedIn: 'root',
})
export class LajiFormComponentEmbedderService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
    private appRef: ApplicationRef,
    private componentService: ComponentService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  embedComponent<T>(
    componentType: Type<T>,
    options: EmbedOptions,
  ): EmbeddedComponentData {
    const componentRef =
      this.componentService.createComponentFromType(componentType);
    this.appRef.attachView(componentRef.hostView);
    const elem = componentRef.location.nativeElement.firstChild;

    const data: EmbeddedComponentData = { componentRef, options, elem };
    this.embedData(data);
    return data;
  }

  updateAfterDomChange(data: EmbeddedComponentData) {
    if (data.elem && this.document.body.contains(data.elem)) {
      return;
    }
    this.embedData(data);
  }

  private embedData(data: EmbeddedComponentData) {
    const anchorElem: HTMLElement | null | undefined =
      this.document.getElementsByClassName(
        data.options.anchorClassName,
      )?.[0] as HTMLElement | null | undefined;
    if (!anchorElem) {
      return;
    }
    this.insertElement(anchorElem, data.elem, data.options.positionToAnchor);
  }

  private insertElement(
    anchorElem: HTMLElement,
    newElem: HTMLElement,
    positionToAnchor: RelativePosition,
  ) {
    if (positionToAnchor === 'firstChild') {
      this.renderer.insertBefore(anchorElem, newElem, anchorElem.firstChild);
    } else if (
      positionToAnchor === 'nextSibling' ||
      positionToAnchor === 'parentNextSibling'
    ) {
      let parentElem = anchorElem.parentElement;

      if (positionToAnchor === 'parentNextSibling') {
        anchorElem = parentElem as HTMLElement;
        parentElem = parentElem?.parentElement as HTMLElement;
      }

      this.renderer.insertBefore(parentElem, newElem, anchorElem.nextSibling);
    }
  }
}
