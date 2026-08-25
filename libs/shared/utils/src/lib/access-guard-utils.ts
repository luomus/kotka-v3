import {
  KotkaObjectFullType,
  KotkaMainDocument,
  KotkaDocument,
} from '@kotka/shared/models';
import { isBranch, Person } from '@luomus/laji-schema';
import moment from 'moment';
import { MARoleKotkaEnum } from '@luomus/laji-schema';

const deleteAllowedForTypes = [
  KotkaObjectFullType.dataset,
  KotkaObjectFullType.transaction,
  KotkaObjectFullType.organization,
  KotkaObjectFullType.document,
  KotkaObjectFullType.branch
];

export function isAdmin(user: Person): boolean {
  return user.role?.includes('MA.admin') || user.roleKotka === 'MA.admin';
}

export function allowEditForUser(document: Partial<KotkaMainDocument>, user: Person): boolean {
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

export function allowDeleteForUser(document: Partial<KotkaDocument>, user: Person): boolean {
  if (!isFullDocument(document)) {
    return false;
  }

  if (!deleteAllowedForTypes.includes(document['@type'] as KotkaObjectFullType)) {
    return false;
  }

  if (user.role?.includes('MA.admin')) {
    return true;
  }

  if (!isBranch(document)) {
    if (!document.dateCreated) {
      return false;
    }

    if (moment(document.dateCreated).add({ d: 14 }).isBefore(moment())) {
      return false;
    }
  }

  return true;
}

export function allowAllImageDeleteForUser(user: Person): boolean {
  const allowedKotkaRoles: MARoleKotkaEnum[] = ['MA.admin', 'MA.advanced'];

  return user.role?.includes('MA.admin') || (!!user.roleKotka && allowedKotkaRoles.includes(user.roleKotka));
}

function isFullDocument(document: Partial<KotkaDocument> | KotkaDocument): document is KotkaDocument {
  return !!document['@type'];
}
