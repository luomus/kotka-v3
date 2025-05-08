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
  private unselectableFields = signal<string[]>([]);
  private unselectableFieldsErrorMsg = signal<string|undefined>(undefined);

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
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('unselectableFields', this.unselectableFields());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('unselectableFieldsErrorMsg', this.unselectableFieldsErrorMsg());
    });
  }

  startFieldChooser(
    lajiForm: LajiFormComponent,
    selectedFields: string[] = [],
    ignoreFields: string[] = [],
    unselectableFields: string[] = [],
    unselectableFieldsErrorMsg?: string
  ) {
    if (this.isActive()) {
      throw new Error('Field chooser is already started');
    }

    const schema = lajiForm.form?.schema;
    if (!schema) {
      throw new Error('Form is missing');
    }

    const containerElem: HTMLElement = lajiForm.lajiFormRoot.nativeElement;
    containerElem.children[0].setAttribute('inert', '');
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
    this.unselectableFields.set(unselectableFields);
    this.unselectableFieldsErrorMsg.set(unselectableFieldsErrorMsg);

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
    this.unselectableFields.set([]);
    this.unselectableFieldsErrorMsg.set(undefined);

    this.lajiFormDestroySub?.unsubscribe();

    return selectedFields;
  }
}
