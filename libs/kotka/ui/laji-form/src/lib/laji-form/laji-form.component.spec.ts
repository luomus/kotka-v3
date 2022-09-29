import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LajiFormComponent } from './laji-form.component';

describe('LajiFormComponentComponent', () => {
  let component: LajiFormComponent;
  let fixture: ComponentFixture<LajiFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LajiFormComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LajiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
