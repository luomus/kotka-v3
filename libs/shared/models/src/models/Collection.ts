/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Collection {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Secure level (salaus-/karkeistustaso) for the data
   */
  secureLevel?:
    | ""
    | "MX.secureLevelNone"
    | "MX.secureLevelKM1"
    | "MX.secureLevelKM5"
    | "MX.secureLevelKM10"
    | "MX.secureLevelKM25"
    | "MX.secureLevelKM50"
    | "MX.secureLevelKM100"
    | "MX.secureLevelHighest"
    | "MX.secureLevelNoShow";
  /**
   * Official abbreviation (or acronym) for this collection
   */
  abbreviation?: string;
  /**
   * Admin field. Is it allowed to use collection with data warehouse /statistic endpoints.
   */
  allowedForDwStatistics?: boolean;
  /**
   * Example how to cite this collection in a scientific article, if using organization, name and abbreviation is not enough.
   */
  citation?: string;
  /**
   * Where is the collection physically located? E.g. building name and room number. [not shown in public]
   */
  collectionLocation?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Name of the collection in different languages. (Not name of collection database.)
   */
  collectionName: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Quality classification for the collection.
   */
  collectionQuality: "MY.collectionQualityEnum3" | "MY.collectionQualityEnum2" | "MY.collectionQualityEnum1";
  /**
   * How many specimens, records or such does the collection contain? Fill in approximate number, describe more in notes if necessary.
   */
  collectionSize?: string;
  /**
   * Type of the collection (specimen, monitoring etc).
   */
  collectionType:
    | "MY.collectionTypeSpecimens"
    | "MY.collectionTypeLiving"
    | "MY.collectionTypeMonitoring"
    | "MY.collectionTypeObservations"
    | "MY.collectionTypePublicationdata"
    | "MY.collectionTypePublication"
    | "MY.collectionTypeMixed"
    | "MY.collectionTypeOther"
    | "MY.collectionTypeGardenArea"
    | "MY.collectionTypeIndoorGardenArea"
    | "MY.collectionTypeOutdoorGardenArea"
    | "MY.collectionTypeGardenSublocation";
  /**
   * Legal basis for concealment or quarantine
   */
  concealmentBasis?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Personal or general (e.g. group of people in the organisation) email address to reach the person(s) responsible.
   */
  contactEmail: string;
  /**
   * Concise definition of the coverage, if not clear from name or description. For example, 'Winter birds of Finland'.
   */
  coverageBasis?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Where is the digitized data stored and backed up? Be exact, so that others can find the data. [not shown in public]
   */
  dataLocation?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Diary-like notes about the data, with date/time. For example "2020-08-19: Changed country names Fönland to Finland", or "Specimens collected during 2019 are missing coordinates due to malfunctioning GPS"
   */
  dataNotes?: string;
  /**
   * Quality estimation for the data in this collection
   */
  dataQuality?:
    | ""
    | "MY.dataQuality1"
    | "MY.dataQuality2"
    | "MY.dataQuality3"
    | "MY.dataQuality4"
    | "MY.dataQuality5"
    | "MY.dataQualityNA";
  /**
   * Description and reasons for the data quality in different languages.
   */
  dataQualityDescription?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Embargo period in years after which data is opened
   */
  dataQuarantinePeriod?: number;
  /**
   * Description of possible special terms for data use (for example not for commercial purposes etc.)
   */
  dataUseTerms?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Free-form description of the collection in different languages.
   */
  description: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * How many percent of the collection is in digital form, e.g. in a database or Excel file? Fill in approximate number, describe more in notes if necessary.
   */
  digitizedSize?: string;
  /**
   * Admin field. The identifier of the person responsible for handling requests for restricted data for this set (typically same person who's responsible for the collection)
   */
  downloadRequestHandler?: string[];
  /**
   * Reason for this edit or notes about it.
   */
  editNotes?: string;
  /**
   * Admin field. DOI received from GBIF after the collection has been published.
   */
  gbifDoi?: string;
  /**
   * Smallest common geographical area for the specimens/data in the collection (for example, country or continent name).
   */
  geographicCoverage?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Description of the rights governing the data (for example, what contracts have been made about this). If left blank, Luomus data policy is followed.
   */
  intellectualDescription?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Name of the institution or organisation publishing the data.
   */
  intellectualOwner?: string;
  /**
   * License which is used when publishing data that belongs to this collection.
   */
  intellectualRights:
    | "MY.intellectualRightsCC-BY"
    | "MY.intellectualRightsCC0"
    | "MY.intellectualRightsPD"
    | "MY.intellectualRightsARR";
  /**
   * Is the data to be used only within Kotka?
   */
  internalUseOnly?: boolean;
  /**
   * Which parent or larger collection this is part of.
   */
  isPartOf?: string;
  /**
   * Language the data is (mainly) written in, if applicable.
   */
  language?: string;
  metadataCreator?: string;
  /**
   * Indication of how comprehensive the information on this form is.
   */
  metadataStatus?:
    | ""
    | "MY.metadataStatusPreliminary"
    | "MY.metadataStatusSatisfactory"
    | "MY.metadataStatusComprehensive"
    | "MY.metadataStatusHidden";
  /**
   * Methods used when creating this collection, if they are standardized. Includes information on items such as census methods, tools, instrument calibration and software.
   */
  methods?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Additional information to the data in each section.
   */
  notes?: string;
  /**
   * Web address (URL) with more info about the collection.
   */
  onlineUrl?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Person(s) responsible for the collection (Lastname, Firstname; Lastname, Firstname).
   */
  personResponsible: string;
  /**
   * Used for botanic garden collections. Is the collection/garden area accessible to public or not.
   */
  publicAccess?: boolean;
  /**
   * Description of possible restrictions on publication of the data (for example, is there data about endangered species which should be concealed?)
   */
  publicationDescription?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * How can Luomus publish the data, if it is owned by third party?
   */
  publicationTerms?:
    | ""
    | "MY.publicationTermsFree"
    | "MY.publicationTermsOfficial"
    | "MY.publicationTermsInternal"
    | "MY.publicationTermsNone";
  /**
   * Admin field. Name that is easy for users to remember and understand. E.g. "Luomus", "University of Turku".
   */
  publisherShortname?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * Admin field. Can the data be shared to GBIF or not: Given collection ID means data is shared under that collection.
   */
  shareToGbif?: string;
  /**
   * Lowest common taxon in the collection (for example, scientific name of an order).
   */
  taxonomicCoverage?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * When were the specimens/data collected?
   */
  temporalCoverage?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  /**
   * How many TYPE specimens does the collection contain?  Fill in approximate number, describe more in notes if necessary.
   */
  typesSize?: string;
  creator?: string;
  dateCreated?: string;
  dateEdited?: string;
  editor?: string;
  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;
  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
   */
  publicityRestrictions?:
    | ""
    | "MZ.publicityRestrictionsPublic"
    | "MZ.publicityRestrictionsProtected"
    | "MZ.publicityRestrictionsPrivate";
}
