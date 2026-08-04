import { Identification } from "@luomus/laji-schema/models";

export function identificationSort(identifications: Identification[]): Identification[] {
 return identifications.sort((a, b) => compareIdentification(a, b));
}

export function compareIdentification(a: Identification, b: Identification): number {
  if (a.preferredIdentification && !b.preferredIdentification) {
    return -1;
  } else if (!a.preferredIdentification && b.preferredIdentification) {
    return 1;
  }

  let dateA;
  let dateStringA;
  try {
    if (a.detDate) {
      dateA = new Date(a.detDate);
    }
  } catch (e) {
    dateStringA = a.detDate;
  }

  let dateB;
  let dateStringB;
  try {
    if (b.detDate) {
      dateB = new Date(b.detDate);
    }
  } catch (e) {
    dateStringB = b.detDate;
  }

  if (dateA && dateB) {
    return dateB.getTime() - dateA.getTime();
  } else if (dateA && !dateB) {
    return -1;
  } else if (!dateA && dateB) {
    return 1;
  } else if (dateStringA && !dateStringB) {
    return -1
  } else if (!dateStringA && dateStringB) {
    return 1;
  }

  return 0;
}
