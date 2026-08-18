import { KotkaDocumentType } from '@kotka/shared/models';
import { capitalize } from 'lodash';

const specialNameMap: Partial<Record<KotkaDocumentType, string>> = {
  [KotkaDocumentType.dataset]: 'tag'
};

export const getDataTypeName = (type: KotkaDocumentType, capitalizeName?: boolean, plural?: boolean): string => {
  let name: string = specialNameMap[type] ? specialNameMap[type] : type.toString();

  if (capitalizeName) {
    name = capitalize(name);
  }
  if (plural) {
    name += 's';
  }

  return name;
};
