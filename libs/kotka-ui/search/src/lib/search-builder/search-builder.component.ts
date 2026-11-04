import {
  ChangeDetectionStrategy,
  Component,
  input,
  model, output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTypeaheadComponent } from '../field-typeahead/field-typeahead.component';
import {
  BuilderQuery,
  MultiSearchField,
  SearchCriteria,
  SearchGroup,
  SearchOperator,
  JoinOperator
} from '../models';
import { SEARCH_OPERATORS } from '../constants';
import { CriteriaCanHaveValuePipe } from '../pipes/criteria-can-have-value.pipe';
import { SearchField } from '@kotka/shared/models';
import { OperatorsForFieldPipe, getOperatorsForField } from '../pipes/operators-for-field.pipe';
import { SearchValueInputComponent } from '../search-value-input/search-value-input.component';


export function createCriteria(): SearchCriteria {
  return { field: '', operator: 'equals', value: '' };
}

export function createGroup(): SearchGroup {
  return { criteria: [createCriteria()], joinOperator: 'AND' };
}

export function createBuilderQuery(): BuilderQuery {
  return { groups: [createGroup()], joinOperator: 'AND' };
}

@Component({
  selector: 'kui-search-builder',
  imports: [
    FormsModule,
    FieldTypeaheadComponent,
    SearchValueInputComponent,
    CriteriaCanHaveValuePipe,
    OperatorsForFieldPipe,
  ],
  templateUrl: './search-builder.component.html',
  styleUrls: ['./search-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBuilderComponent {
  query = model<BuilderQuery | null>(createBuilderQuery());

  fields = input.required<SearchField[]>();
  fieldMap = input.required<Record<string, SearchField>>();
  multiFields = input.required<MultiSearchField[]>();
  multiFieldMap = input.required<Record<string, MultiSearchField>>();

  enterSubmit = output<void>();

  operators = SEARCH_OPERATORS;

  setField(groupIdx: number, criteriaIdx: number, field: string) {
    this.modifyQuery((query) => {
      const criteria = query.groups[groupIdx].criteria[criteriaIdx];
      criteria.field = field;

      const operators = getOperatorsForField(
        field,
        this.fieldMap(),
        this.multiFieldMap(),
      );
      if (!operators.some((operator) => operator.id === criteria.operator)) {
        criteria.operator = 'equals';
      }
    });
  }

  setOperator(groupIdx: number, criteriaIdx: number, operator: SearchOperator) {
    this.modifyQuery((query) => {
      query.groups[groupIdx].criteria[criteriaIdx].operator = operator;
    });
  }

  setValue(
    groupIdx: number,
    criteriaIdx: number,
    value: string,
    isSecondValue = false,
  ) {
    this.modifyQuery((query) => {
      if (isSecondValue) {
        query.groups[groupIdx].criteria[criteriaIdx].value2 = value;
      } else {
        query.groups[groupIdx].criteria[criteriaIdx].value = value;
      }
    });
  }

  setGroupOperator(groupIdx: number, operator: JoinOperator) {
    this.modifyQuery((query) => {
      query.groups[groupIdx].joinOperator = operator;
    });
  }

  setGroupsOperator(operator: JoinOperator) {
    this.modifyQuery((query) => {
      query.joinOperator = operator;
    });
  }

  addCriteria(groupIdx: number) {
    this.modifyQuery((query) => {
      query.groups[groupIdx].criteria.push(createCriteria());
    });
  }

  removeCriteria(groupIdx: number, critIdx: number) {
    this.modifyQuery((query) => {
      query.groups[groupIdx].criteria.splice(critIdx, 1);
    });
  }

  addGroup() {
    this.modifyQuery((query) => {
      query.groups.push(createGroup());
    });
  }

  removeGroup(groupIdx: number) {
    this.modifyQuery((query) => {
      query.groups.splice(groupIdx, 1);
    });
  }

  private modifyQuery(modify: (query: BuilderQuery) => void) {
    this.query.update((query) => {
      if (!query) {
        return query;
      }
      const clone = structuredClone(query);
      modify(clone);
      return clone;
    });
  }
}
