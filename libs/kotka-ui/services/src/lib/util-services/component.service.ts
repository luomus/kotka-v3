import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Inject,
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
  Type
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ComponentService {
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    private appRef: ApplicationRef,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  createComponentFromType<T>(
    componentType: Type<T>,
    hostElement?: HTMLElement,
  ): ComponentRef<T> {
    const environmentInjector = this.environmentInjector;
    const elementInjector = Injector.create({
      providers: [],
      parent: this.injector,
    });
    return createComponent(componentType, {
      environmentInjector,
      elementInjector,
      hostElement,
    });
  }

  attachComponent<T>(componentRef: ComponentRef<T>, parentElem?: HTMLElement) {
    this.appRef.attachView(componentRef.hostView);
    const elem = componentRef.location.nativeElement;
    this.renderer.appendChild(parentElem || this.document.body, elem);
  }

  removeComponent<T>(componentRef: ComponentRef<T>) {
    const parent = componentRef.location.nativeElement.parentElement;
    parent?.removeChild(componentRef.location.nativeElement);
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
}
