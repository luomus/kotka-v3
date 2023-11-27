import {
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  constructor(
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  createComponentFromType<T>(componentType: Type<T>): ComponentRef<T> {
    const environmentInjector = this.environmentInjector;
    const elementInjector = Injector.create({
      providers: [],
      parent: this.injector,
    });
    return createComponent(componentType, {
      environmentInjector,
      elementInjector
    });
  }
}
