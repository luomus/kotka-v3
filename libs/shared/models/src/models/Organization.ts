/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Organization {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Organisation website. Include http://
   */
  URL?: string;
  /**
   * Official code for this organization, if one exists
   */
  abbreviation?: string;
  /**
   * If organisation code is given, the source for it must be chosen.
   */
  abbreviationExplanation?:
    | ""
    | "MOS.abbreviation-explanationIndexHerbariorum"
    | "MOS.abbreviation-explanationInsectAndSpiderCollectionsOfTheWorld";
  /**
   * Filled in by ICT team
   */
  ad?: string;
  /**
   * Name of content/collection contact person for the organization.
   */
  contentContact?: string;
  /**
   * Name of the country as on a postal address.
   */
  country?: string;
  /**
   * Datasets this organisation belongs to.
   */
  datasetID?: string[];
  /**
   * Last date for sending seed orders to this organization.
   */
  dateOrdersDue?: string;
  editNotes?: string;
  /**
   * Contact email address for the organization, or address of a contact person.
   */
  email?: string;
  /**
   * Fax number, with country code
   */
  fax?: string;
  /**
   * Used for organisations that are not to be used (duplicates etc.)
   */
  hidden?: boolean;
  /**
   * Usually city name
   */
  locality?: string;
  /**
   * Web address where the logo of the organization is located. Used on Kotka transaction PDFs for now.
   */
  logo?: string;
  /**
   * Free-text notes
   */
  notes?: string;
  /**
   * Please see if the first level of the organization is pickable from a list. If not, only then write its name here. This is to avoid different spellings of the same organization. E.g. 'University of Sipoo'
   */
  organizationLevel1: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * e.g. 'Sipoo Natural History Museum' (belonging to the aforementioned university)
   */
  organizationLevel2?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * e.g. 'Zoological Museum'
   */
  organizationLevel3?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * e.g. 'Herpetology team'
   */
  organizationLevel4?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Phone number for organization or contact person, with country code.
   */
  phone?: string;
  /**
   * Insert only numbers, leave 'P.O. Box', 'PL' or such out.
   */
  postOfficeBox?: string;
  postalCode?: string;
  /**
   * E.g. state or province; use only if needed in the postal address
   */
  region?: string;
  streetAddress?: string;
  contentContactID?: string[];
  creator?: string;
  dateCreated?: string;
  dateEdited?: string;
  editor?: string;
  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;
}
