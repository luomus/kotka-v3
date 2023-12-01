import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaFieldsComponent } from './meta-fields.component';

describe('MetaFieldsComponent', () => {
  let component: MetaFieldsComponent;
  let fixture: ComponentFixture<MetaFieldsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetaFieldsComponent]
    });
    fixture = TestBed.createComponent(MetaFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
