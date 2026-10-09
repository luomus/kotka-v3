import { IndexType, KotkaDocumentType } from '@kotka/shared/models';
import { capitalize } from 'lodash';

const specialNameMap: Partial<Record<KotkaDocumentType, string>> = {
  [KotkaDocumentType.dataset]: 'tag'
};
const indexTypeNameMap: Record<IndexType, string> = {
  identification: 'identification',
  sample: 'sample',
  typeSpecimen: 'type specimen',
  unit: 'specimen/observation'
};

export const getDataTypeName = (type: KotkaDocumentType, capitalizeName?: boolean, plural?: boolean, indexType?: IndexType): string => {
  let name: string;
  if (indexType) {
    name = indexTypeNameMap[indexType];
  } else {
    name = specialNameMap[type] ? specialNameMap[type] : type.toString();
  }

  if (capitalizeName) {
    name = capitalize(name);
  }
  if (plural) {
    name += 's';
  }

  return name;
};
