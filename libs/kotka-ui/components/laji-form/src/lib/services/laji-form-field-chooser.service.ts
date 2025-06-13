import {
  ComponentRef,
  effect,
  Injectable,
  signal
} from '@angular/core';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { ComponentService } from '@kotka/ui/services';
import { FieldChooserMode, LajiFormFieldChooserComponent } from './laji-form-field-chooser.component';
import { Subscription } from 'rxjs';
import { FieldChooserColorTheme } from './laji-form-field-chooser-highlight.component';

export interface LajiFormFieldChooserOptions {
  mode?: FieldChooserMode;
  selected?: string[];
  ignoreFields?: string[];
  unselectableFields?: string[];
  unselectableFieldsErrorMsg?: string;
  colorTheme?: FieldChooserColorTheme;
}

@Injectable({
  providedIn: 'root',
})
export class LajiFormFieldChooserService {
  private isActiveSignal = signal<boolean>(false);
  isActive = this.isActiveSignal.asReadonly();

  private formContainerElem = signal<HTMLElement|undefined>(undefined);
  private fieldChooserComponentRef = signal<ComponentRef<LajiFormFieldChooserComponent>|undefined>(undefined);

  private mode = signal<FieldChooserMode>('fieldSelect');
  private selected = signal<string[]>([]);
  private ignoreFields = signal<string[]>([]);
  private unselectableFields = signal<string[]>([]);
  private unselectableFieldsErrorMsg = signal<string|undefined>(undefined);
  private colorTheme = signal<FieldChooserColorTheme>('red');

  private lajiFormDestroySub?: Subscription;

  constructor(
    private componentService: ComponentService
  ) {
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('mode', this.mode());
    });
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('selected', this.selected());
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
    effect(() => {
      this.fieldChooserComponentRef()?.setInput('colorTheme', this.colorTheme());
    });
  }

  startFieldChooser(lajiForm: LajiFormComponent, options?: LajiFormFieldChooserOptions) {
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
    componentRef.instance.selectedChange.subscribe(newSelected => {
      this.selected.set(newSelected);
    });
    this.componentService.attachComponent(componentRef, containerElem);
    this.fieldChooserComponentRef.set(componentRef);

    this.isActiveSignal.set(true);

    this.mode.set(options?.mode || 'fieldSelect');
    this.selected.set(options?.selected || []);
    this.ignoreFields.set(options?.ignoreFields || []);
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

    const selected = this.selected();

    this.formContainerElem()?.children[0]?.removeAttribute('inert');
    this.formContainerElem.set(undefined);

    const componentRef = this.fieldChooserComponentRef();
    if (componentRef) {
      this.componentService.removeComponent(componentRef);
      this.fieldChooserComponentRef.set(undefined);
    }

    this.isActiveSignal.set(false);

    this.mode.set('fieldSelect');
    this.selected.set([]);
    this.ignoreFields.set([]);
    this.unselectableFields.set([]);
    this.unselectableFieldsErrorMsg.set(undefined);
    this.colorTheme.set('red');

    this.lajiFormDestroySub?.unsubscribe();

    return selected;
  }
}
