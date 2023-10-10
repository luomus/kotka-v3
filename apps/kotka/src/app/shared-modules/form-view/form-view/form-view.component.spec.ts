import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormViewComponent } from './form-view.component';
import { KotkaObjectType } from '@kotka/api-interfaces';

describe('FormViewComponent', () => {
  let component: FormViewComponent<KotkaObjectType>;
  let fixture: ComponentFixture<FormViewComponent<KotkaObjectType>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
