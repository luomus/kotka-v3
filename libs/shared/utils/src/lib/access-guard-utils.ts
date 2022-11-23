import { KotkaDocumentObject, Person } from "@kotka/shared/models";
import * as moment from 'moment'

export function allowAccessByOrganization(document: KotkaDocumentObject, user: Person): boolean {
  if (!document.owner || !user.organisation) {
    return false;
  }

  if (user.organisation.includes(document.owner)) {
    return true;
  }

  return false;
}

export function allowAccessByTime(document: KotkaDocumentObject, time: {[key: string]: number}): boolean {
  if (!document.dateCreated) {
    return false;
  }

  if (moment(document.dateCreated).add(time).isBefore(moment())) {
    return false;
  }

  return true;
}
