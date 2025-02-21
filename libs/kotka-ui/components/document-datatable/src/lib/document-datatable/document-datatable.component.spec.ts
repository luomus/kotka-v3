import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentDatatableComponent } from './document-datatable.component';

describe('UiDocumentDatatableComponent', () => {
  let component: DocumentDatatableComponent;
  let fixture: ComponentFixture<DocumentDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDatatableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
