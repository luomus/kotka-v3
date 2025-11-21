import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
  inject,
  DOCUMENT
} from '@angular/core';
import { Document as KotkaDocument, LajiForm } from '@kotka/shared/models';
import { NgClass } from '@angular/common';
import { JSONPointerToId, parseSchemaFromFormDataPointer } from '@luomus/laji-form/lib/utils';
import { getEnumValue } from '@kotka/ui/services';
import { getUri } from '@kotka/shared/utils';

interface NavItem {
  id: string;
  label: string;
  field?: string;
  children?: Exclude<NavItem, 'children'>[];
}

const getTitleId = (jsonPointer: string) => {
  return 'root_' + JSONPointerToId(jsonPointer) + '-header';
};

@Component({
  imports: [NgClass],
  selector: 'kotka-specimen-form-nav',
  templateUrl: './specimen-form-nav.html',
  styleUrls: ['./specimen-form-nav.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenFormNavComponent {
  form = input.required<LajiForm.SchemaForm>();
  formData = input.required<KotkaDocument | Partial<KotkaDocument>>();

  active?: string;
  activeChild?: string;

  scrollToId = output<string>();
  scrollToField = output<string>();

  navItems = computed(() => this.getNavItems(this.formData()));

  private preparationTypeField = computed(() =>
    parseSchemaFromFormDataPointer(
      this.form().schema,
      '/gatherings/0/units/0/samples/0/preparationType',
    ),
  );

  private document = inject(DOCUMENT);

  @HostListener('window:scroll', [])
  onScroll() {
    const getActiveIdx = (items: {id: string}[], marginTop = 70): number | undefined => {
      return items.reduce((result, item, idx) => {
        const top = this.document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top < marginTop) {
          return idx;
        }
        return result;
      }, undefined as number | undefined);
    };

    const activeIdx = getActiveIdx(this.navItems());
    this.active = activeIdx !== undefined ? this.navItems()[activeIdx].id : undefined;

    if (activeIdx !== undefined) {
      const children = this.navItems()[activeIdx].children || [];
      const activeChildIdx = getActiveIdx(children);
      this.activeChild = activeChildIdx !== undefined ? children[activeChildIdx].id : undefined;
    }
  }

  onNavItemClick(navItem: NavItem) {
    if (navItem.field) {
      this.scrollToField.emit(navItem.field);
    } else {
      this.scrollToId.emit(navItem.id);
    }
  }

  private getNavItems(formData: KotkaDocument | Partial<KotkaDocument>): NavItem[] {
    const result: NavItem[] = [];

    result.push({
      id: 'basicFieldsTitle',
      label: 'Basic Information',
    });

    formData.gatherings?.[0]?.units?.forEach((unit, idx) => {
      const children: Exclude<NavItem, 'children'>[] = [];

      unit.identifications?.forEach((identification, i) => {
        const field = '/gatherings/0/units/' + idx + '/identifications/' + i;
        children.push({
          id: getTitleId(field),
          field,
          label: 'Identification: ' + (identification.taxon || ''),
        });
      });

      unit.typeSpecimens?.forEach((type, i) => {
        const field = '/gatherings/0/units/' + idx + '/typeSpecimens/' + i;
        children.push({
          id: getTitleId(field),
          field,
          label: 'Type: ' + (type.typeSpecies || ''),
        });
      });

      unit.samples?.forEach((sample, i) => {
        const field = '/gatherings/0/units/' + idx + '/samples/' + i;

        const preparationType = getEnumValue(sample.preparationType || '', this.preparationTypeField(), 'schema');
        const uri = getUri(sample.id || '');
        const label = [preparationType, uri].filter(val => !!val).join(' ');

        children.push({
          id: getTitleId(field),
          field,
          label: 'Sample: ' + label,
        });
      });

      const field = '/gatherings/0/units/' + idx;
      result.push({
        id: getTitleId(field),
        label: 'Specimen/Observation',
        field,
        children,
      });
    });

    result.push({
      id: 'otherFieldsTitle',
      label: 'Other',
    });

    return result;
  }
}
