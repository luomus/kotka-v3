import { KotkaRootDocumentType } from '@kotka/shared/models';
import { capitalize } from 'lodash';

const specialNameMap: Partial<Record<KotkaRootDocumentType, string>> = {
  [KotkaRootDocumentType.dataset]: 'tag'
};

export const getDataTypeName = (type: KotkaRootDocumentType, capitalizeName?: boolean, plural?: boolean): string => {
  let name: string = specialNameMap[type] ? specialNameMap[type] : type.toString();

  if (capitalizeName) {
    name = capitalize(name);
  }
  if (plural) {
    name += 's';
  }

  return name;
};
