import { KotkaDocumentObject, KotkaDocumentObjectFullType } from '@kotka/shared/models';
import { Person } from '@kotka/shared/models';
import moment from 'moment';

const deleteAllowedForTypes = [
  KotkaDocumentObjectFullType.dataset,
  KotkaDocumentObjectFullType.transaction
];

export function allowEditForUser(document: Partial<KotkaDocumentObject>, user: Person): boolean {
  if (user.role?.includes('MA.admin')) {
    return true;
  }

  if (document['@type'] !== KotkaDocumentObjectFullType.organization) {
    if (!document.owner || !user.organisation) {
      return false;
    }

    if (!user.organisation.includes(document.owner)) {
      return false;
    }
  }

  return true;
}

export function allowDeleteForUser(document: KotkaDocumentObject, user: Person): boolean {
  const type = document['@type'] as KotkaDocumentObjectFullType;

  if (!type) {
    return false;
  }

  if (!deleteAllowedForTypes.includes(type)) {
    return false;
  }

  if (user.role?.includes('MA.admin')) {
    return true;
  }

  if (!document.dateCreated) {
    return false;
  }

  if (moment(document.dateCreated).add({ d: 14 }).isBefore(moment())) {
    return false;
  }

  return true;
}
