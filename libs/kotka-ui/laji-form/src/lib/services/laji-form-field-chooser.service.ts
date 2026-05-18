import { ComponentRef, effect, Injectable, OutputRefSubscription, signal, inject } from '@angular/core';
import LajiFormComponent from '../laji-form/laji-form.component';
import { ComponentService } from '@kotka/ui/core';
import {
  FieldChooserIgnoreFieldType,
  FieldChooserMode,
  LAJI_FORM_ROOT_ID,
  LajiFormFieldChooserComponent
} from './laji-form-field-chooser.component';
import { FieldChooserColorTheme } from './laji-form-field-chooser-highlight.component';
import { LajiForm } from '@kotka/shared/models';

export interface LajiFormFieldChooserOptions {
  mode?: FieldChooserMode;
  selected?: string[];
  ignoreFieldsOfType?: FieldChooserIgnoreFieldType[];
  unselectableFields?: string[];
  unselectableFieldsErrorMsg?: string;
  colorTheme?: FieldChooserColorTheme;
}

@Injectable({
  providedIn: 'root',
})
export class LajiFormFieldChooserService {
  private componentService = inject(ComponentService);

  private isActiveSignal = signal<boolean>(false);
  isActive = this.isActiveSignal.asReadonly();

  private selectedFieldsSignal = signal<string[]>([]);
  selectedFields = this.selectedFieldsSignal.asReadonly();

  private fieldChooserComponentRef = signal<ComponentRef<LajiFormFieldChooserComponent>|undefined>(undefined);

  private form = signal<LajiForm.SchemaForm|undefined>(undefined);
  private formElem = signal<HTMLElement|undefined>(undefined);
  private formContainerElem = signal<HTMLElement|undefined>(undefined);

  private mode = signal<FieldChooserMode>('fieldSelect');
  private ignoreFieldsOfType = signal<FieldChooserIgnoreFieldType[]>([]);
  private unselectableFields = signal<string[]>([]);
  private unselectableFieldsErrorMsg = signal<string|undefined>(undefined);
  private colorTheme = signal<FieldChooserColorTheme>('red');

  private lajiFormDestroySub?: OutputRefSubscription;

  constructor() {
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('form', this.form());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('formContainerElem', this.formContainerElem());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('mode', this.mode());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('selected', this.selectedFieldsSignal());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('ignoreFieldsOfType', this.ignoreFieldsOfType());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('unselectableFields', this.unselectableFields());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('unselectableFieldsErrorMsg', this.unselectableFieldsErrorMsg());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('colorTheme', this.colorTheme());
    });
  }

  startFieldChooser(lajiForm: LajiFormComponent, options?: LajiFormFieldChooserOptions) {
    if (this.isActive()) {
      throw new Error('Field chooser is already started');
    }

    const form = lajiForm.form();
    if (!form) {
      throw new Error('Form is missing');
    }

    const formElem: HTMLElement | null = lajiForm.lajiFormRoot.nativeElement.querySelector(`#${LAJI_FORM_ROOT_ID}`);
    const containerElem = formElem?.parentElement;
    if (!formElem || !containerElem) {
      throw new Error('Form element or its container is missing');
    }

    this.form.set(form);
    formElem.setAttribute('inert', '');
    this.formElem.set(formElem);
    this.formContainerElem.set(containerElem);

    const componentRef = this.componentService.createComponentFromType(LajiFormFieldChooserComponent);
    componentRef.instance.selectedChange.subscribe(newSelected => {
      this.selectedFieldsSignal.set(newSelected);
    });
    this.componentService.attachComponent(componentRef, containerElem);
    this.fieldChooserComponentRef.set(componentRef);

    this.isActiveSignal.set(true);

    this.mode.set(options?.mode || 'fieldSelect');
    this.selectedFieldsSignal.set(options?.selected || []);
    this.ignoreFieldsOfType.set(options?.ignoreFieldsOfType || []);
    this.unselectableFields.set(options?.unselectableFields || []);
    this.unselectableFieldsErrorMsg.set(options?.unselectableFieldsErrorMsg);
    this.colorTheme.set(options?.colorTheme || 'red');

    this.lajiFormDestroySub = lajiForm.formDestroy.subscribe(() => {
      this.stopFieldChooser();
    });
  }

  stopFieldChooser(): string[] {
    if (!this.isActive()) {
      throw new Error('Field chooser is not started');
    }

    const selected = this.selectedFieldsSignal();

    this.formElem()?.removeAttribute('inert');
    this.formContainerElem.set(undefined);

    const componentRef = this.fieldChooserComponentRef();
    if (componentRef) {
      this.componentService.removeComponent(componentRef);
      this.fieldChooserComponentRef.set(undefined);
    }

    this.isActiveSignal.set(false);

    this.mode.set('fieldSelect');
    this.selectedFieldsSignal.set([]);
    this.ignoreFieldsOfType.set([]);
    this.unselectableFields.set([]);
    this.unselectableFieldsErrorMsg.set(undefined);
    this.colorTheme.set('red');

    this.lajiFormDestroySub?.unsubscribe();

    return selected;
  }
}
