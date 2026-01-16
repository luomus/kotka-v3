import { KotkaDocumentObject, KotkaDocumentObjectFullType } from '@kotka/shared/models';
import { Person } from '@luomus/laji-schema';
import moment from 'moment';
import { MARoleKotkaEnum } from '@luomus/laji-schema';

const deleteAllowedForTypes = [
  KotkaDocumentObjectFullType.dataset,
  KotkaDocumentObjectFullType.transaction,
  KotkaDocumentObjectFullType.organization,
  KotkaDocumentObjectFullType.document
];

export function allowEditForUser(document: Partial<KotkaDocumentObject>, user: Person): boolean {
  if (user.role?.includes('MA.admin')) {
    return true;
  }

  if (document.owner) {
    if (!user.organisation) {
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

export function allowAllImageDeleteForUser(user: Person): boolean {
  const allowedKotkaRoles: MARoleKotkaEnum[] = ['MA.admin', 'MA.advanced'];

  return user.role?.includes('MA.admin') || (!!user.roleKotka && allowedKotkaRoles.includes(user.roleKotka));
}
