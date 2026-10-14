import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldTypeaheadComponent } from '../field-typeahead/field-typeahead.component';
import { builderQueryToQueryString } from '../services/query-stringify';
import { queryStringToBuilderQuery } from '../services/query-parse';
import {
  BuilderQuery,
  SearchCriteria,
  SearchGroup,
  SearchOperator,
  JoinOperator
} from '../models';
import { SEARCH_OPERATORS } from '../constants';
import { CriteriaCanHaveValuePipe } from '../pipes/criteria-can-have-value.pipe';
import { SearchField } from '@kotka/shared/models';
import { OperatorsForFieldPipe, getOperatorsForType } from '../pipes/operators-for-field.pipe';
import { SearchValueInputComponent } from '../search-value-input/search-value-input.component';
import { validateBuilderQueryValues } from '../services/query-validate';


function createCriteria(): SearchCriteria {
  return { field: '', operator: 'equals', value: '' };
}

function createGroup(): SearchGroup {
  return { criteria: [createCriteria()], joinOperator: 'AND' };
}

function createBuilderQuery(): BuilderQuery {
  return { groups: [createGroup()], joinOperator: 'AND' };
}


@Component({
  selector: 'kui-search-builder',
  imports: [
    FormsModule,
    FieldTypeaheadComponent,
    SearchValueInputComponent,
    CriteriaCanHaveValuePipe,
    OperatorsForFieldPipe
  ],
  templateUrl: './search-builder.component.html',
  styleUrls: ['./search-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBuilderComponent {
  text = model<string>('');

  fields = input<SearchField[]>([]);
  fieldMap = input<Record<string, SearchField>>({});

  query = signal<BuilderQuery | null>(null);

  operators = SEARCH_OPERATORS;

  private activeText = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.text() !== untracked(this.activeText)) {
        this.setFromQueryString(this.text());
        this.activeText.set(this.text());
      }
    });

    effect(() => {
      if (this.query()) {
        const newText = builderQueryToQueryString(this.query()!);
        this.text.set(newText);
        this.activeText.set(newText);
      }
    });
  }

  clear() {
    this.query.set(createBuilderQuery());
  }

  setField(groupIdx: number, criteriaIdx: number, field: string) {
    this.modifyQuery((query) => {
      const criteria = query.groups[groupIdx].criteria[criteriaIdx];
      criteria.field = field;

      const operators = getOperatorsForType(field ? this.fieldMap()[field]?.type : undefined);
      if (!operators.some(operator => operator.id === criteria.operator)) {
        criteria.operator = 'equals';
      }
    });
  }

  setOperator(groupIdx: number, criteriaIdx: number, operator: SearchOperator) {
    this.modifyQuery((query) => {
      query.groups[groupIdx].criteria[criteriaIdx].operator = operator;
    });
  }

  setValue(groupIdx: number, criteriaIdx: number, value: string, isSecondValue = false) {
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

  setFromQueryString(queryString: string) {
    let query: BuilderQuery;

    try {
      query = queryStringToBuilderQuery(queryString);
      validateBuilderQueryValues(query, this.fieldMap());
    } catch (e) {
      console.warn('Failed to parse query string', e);
      this.query.set(null);
      return;
    }

    if (query.groups.length === 0) {
      query.groups.push(createGroup());
    }
    this.query.set(query);
  }
}
