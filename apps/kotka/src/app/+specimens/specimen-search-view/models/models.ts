import {
  AggregationBucketKey,
  SearchField,
} from '@kotka/shared/models';
import { DatatableColumn } from '@kotka/ui/datatable';

export interface LocationFilter {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface FieldValue {
  field: string;
  value: AggregationBucketKey;
}

export interface SpecimenSearchFilters {
  location?: LocationFilter;
  fieldValues: FieldValue[];
}

export interface FieldData {
  fields?: SearchField[];
  fieldMap?: Record<string, SearchField>;
  columns?: DatatableColumn[];
  allAggregateFields?: string[];
  allAggregateColumns?: DatatableColumn[];
  fieldsLoading: boolean;
}
