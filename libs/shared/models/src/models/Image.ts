/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Image {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  LuomusIntellectualRights?: "" | "MM.LuomusRightsFreeToUse" | "MM.LuomusRightsInternalOnly";
  caption?: string;
  captureDateTime?: string;
  capturerVerbatim?: string[];
  documentURI?: string;
  fullURL: string;
  keyword?: string[];
  largeURL: string;
  originalFilename: string;
  originalURL: string;
  sourceSystem: string;
  squareThumbnailURL: string;
  taxonDescriptionCaption?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  taxonURI?: string[];
  taxonVerbatim?: string[];
  thumbnailURL: string;
  uploadedBy: string;
  wgs84Lat?: string;
  wgs84Lon?: string;
  intellectualOwner: string;
  intellectualRights:
    | "MZ.intellectualRightsCC-BY-SA-4.0"
    | "MZ.intellectualRightsCC-BY-NC-4.0"
    | "MZ.intellectualRightsCC-BY-NC-SA-4.0"
    | "MZ.intellectualRightsCC-BY-4.0"
    | "MZ.intellectualRightsCC0-4.0"
    | "MZ.intellectualRightsODBL-1.0"
    | "MZ.intellectualRightsPD"
    | "MZ.intellectualRightsARR"
    | "MZ.intellectualRightsCC-BY-2.0"
    | "MZ.intellectualRightsCC-BY-SA-2.0"
    | "MZ.intellectualRightsCC-BY-SA-2.0-DE"
    | "MZ.intellectualRightsCC-BY-NC-2.0"
    | "MZ.intellectualRightsCC-BY-NC-SA-2.0"
    | "MZ.intellectualRightsCC-BY-NC-ND-2.0"
    | "MZ.intellectualRightsCC-BY-SA-2.5"
    | "MZ.intellectualRightsCC-BY-SA-2.5-SE"
    | "MZ.intellectualRightsCC-BY-3.0"
    | "MZ.intellectualRightsCC-BY-SA-3.0"
    | "MZ.intellectualRightsCC-BY-NC-SA-3.0"
    | "MZ.intellectualRightsCC-BY-ND-4.0"
    | "MZ.intellectualRightsCC-BY-NC-ND-4.0";
  /**
   * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
   */
  publicityRestrictions?:
    | ""
    | "MZ.publicityRestrictionsPublic"
    | "MZ.publicityRestrictionsProtected"
    | "MZ.publicityRestrictionsPrivate";
}
