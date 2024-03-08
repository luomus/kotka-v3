import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, NgbTypeahead, FormsModule],
  declarations: [AutocompleteComponent],
  exports: [AutocompleteComponent]
})
export class KotkaUiAutocompleteModule {}
