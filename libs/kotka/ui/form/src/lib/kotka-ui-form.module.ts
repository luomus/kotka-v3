import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LuomusForm } from './luomus-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ObjectTypeComponent } from './types/object.type.component';
import { ArrayTypeComponent } from './types/array-type.component';
import { FormlyHorizontalWrapper } from './util/horizontal-wrapper';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectTypeComponent } from './types/ng-select-type.component';
import { LuomusFieldComponent } from './luomus-field.component';
import { LuomusValidationMessage } from './luomus-validation-message';
import { ToFormGroupPipe } from './pipes/to-form-group.pipe';
import { ToObservablePipe } from './pipes/to-observable.pipe';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'form-field-horizontal', component: FormlyHorizontalWrapper },
      ],
      extras: { lazyRender: true },
      validationMessages: [
        {
          name: 'required',
          message: 'This field is required',
        },
      ],
      types: [
        {
          wrappers: ['form-field-horizontal'],
          name: 'string',
          extends: 'input',
        },
        {
          wrappers: ['form-field-horizontal'],
          name: 'number',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number',
            },
          },
        },
        {
          wrappers: ['form-field-horizontal'],
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number',
            },
          },
        },
        {
          wrappers: ['form-field-horizontal'],
          name: 'boolean',
          extends: 'checkbox',
        },
        {
          wrappers: ['form-field-horizontal'],
          name: 'enum',
          component: NgSelectTypeComponent,
        },
        {
          name: 'array',
          component: ArrayTypeComponent,
        },
        {
          name: 'object',
          component: ObjectTypeComponent,
        },
      ],
    }),
    FormlyBootstrapModule,
  ],
  exports: [LuomusForm, LuomusFieldComponent, LuomusValidationMessage],
  declarations: [
    LuomusForm,
    LuomusFieldComponent,
    LuomusValidationMessage,
    ObjectTypeComponent,
    ArrayTypeComponent,
    FormlyHorizontalWrapper,
    NgSelectTypeComponent,
    ToFormGroupPipe,
    ToObservablePipe,
  ],
  providers: [],
})
export class KotkaUiFormModule {}
