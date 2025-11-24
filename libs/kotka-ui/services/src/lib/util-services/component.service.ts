import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, Injector, Renderer2, RendererFactory2, Type, DOCUMENT, inject } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class ComponentService {
  private document = inject<Document>(DOCUMENT);
  private injector = inject(Injector);
  private environmentInjector = inject(EnvironmentInjector);
  private appRef = inject(ApplicationRef);

  private renderer: Renderer2;

  constructor() {
    const rendererFactory = inject(RendererFactory2);

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
