import {
  ComponentRef,
  effect,
  Injectable,
  signal
} from '@angular/core';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { ComponentService } from '@kotka/ui/services';
import { LajiFormFieldChooserComponent } from './laji-form-field-chooser.component';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LajiFormFieldChooserService {
  private isActiveSignal = signal<boolean>(false);
  isActive = this.isActiveSignal.asReadonly();

  private formContainerElem = signal<HTMLElement|undefined>(undefined);
  private fieldChooserComponentRef = signal<ComponentRef<LajiFormFieldChooserComponent>|undefined>(undefined);

  private selectedFields = signal<string[]>([]);
  private ignoreFields = signal<string[]>([]);

  private lajiFormDestroySub?: Subscription;

  constructor(
    private componentService: ComponentService
  ) {
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('selectedFields', this.selectedFields());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('ignoreFields', this.ignoreFields());
    });
  }

  startFieldChooser(lajiForm: LajiFormComponent, selectedFields: string[] = [], ignoreFields: string[] = []) {
    if (this.isActive()) {
      throw new Error('Field chooser is already started');
    }

    const containerElem: HTMLElement = lajiForm.lajiFormRoot.nativeElement;
    containerElem.children[0].setAttribute("inert", "");
    this.formContainerElem.set(containerElem);

    const componentRef = this.componentService.createComponentFromType(LajiFormFieldChooserComponent);
    componentRef.instance.selectedFieldsChange.subscribe(newSelectedFields => {
      this.selectedFields.set(newSelectedFields);
    });
    this.componentService.attachComponent(componentRef, containerElem);
    this.fieldChooserComponentRef.set(componentRef);

    this.isActiveSignal.set(true);
    this.selectedFields.set(selectedFields);
    this.ignoreFields.set(ignoreFields);

    this.lajiFormDestroySub = lajiForm.formDestroy.subscribe(() => {
      this.stopFieldChooser();
      throw new Error('Laji form got destroyed while the field chooser was active');
    });
  }

  stopFieldChooser(): string[] {
    if (!this.isActive()) {
      throw new Error('Field chooser is not started');
    }

    const selectedFields = this.selectedFields();

    this.formContainerElem()?.children[0].removeAttribute('inert');
    this.formContainerElem.set(undefined);

    const componentRef = this.fieldChooserComponentRef();
    if (componentRef) {
      this.componentService.removeComponent(componentRef);
      this.fieldChooserComponentRef.set(undefined);
    }

    this.isActiveSignal.set(false);
    this.selectedFields.set([]);
    this.ignoreFields.set([]);

    this.lajiFormDestroySub?.unsubscribe();

    return selectedFields;
  }
}
