import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionHistoryViewComponent } from './version-history-view.component';

describe('VersionHistoryViewComponent', () => {
  let component: VersionHistoryViewComponent;
  let fixture: ComponentFixture<VersionHistoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VersionHistoryViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionHistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
