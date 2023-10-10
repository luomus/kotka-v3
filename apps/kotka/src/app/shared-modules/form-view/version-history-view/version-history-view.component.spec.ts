import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionHistoryViewComponent } from './version-history-view.component';
import { KotkaObjectType } from '@kotka/api-interfaces';

describe('VersionHistoryViewComponent', () => {
  let component: VersionHistoryViewComponent<KotkaObjectType>;
  let fixture: ComponentFixture<VersionHistoryViewComponent<KotkaObjectType>>;

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
