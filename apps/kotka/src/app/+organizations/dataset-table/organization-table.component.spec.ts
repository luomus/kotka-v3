import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTableComponent } from './organization-table.component';

describe('DatasetTableComponent', () => {
  let component: OrganizationTableComponent;
  let fixture: ComponentFixture<OrganizationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
