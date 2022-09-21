/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Occurrence {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  area: string;
  notes?: string;
  specimenURI?: string;
  status:
    | "MX.doesNotOccur"
    | "MX.typeOfOccurrenceOccurs"
    | "MX.typeOfOccurrenceStablePopulation"
    | "MX.typeOfOccurrenceCommon"
    | "MX.typeOfOccurrenceRare"
    | "MX.typeOfOccurrenceVeryRare"
    | "MX.typeOfOccurrenceVagrant"
    | "MX.typeOfOccurrenceRareVagrant"
    | "MX.typeOfOccurrenceMigrant"
    | "MX.typeOfOccurrenceImport"
    | "MX.typeOfOccurrenceAnthropogenic"
    | "MX.typeOfOccurrenceNotEstablished"
    | "MX.typeOfOccurrenceExtirpated"
    | "MX.typeOfOccurrenceOldRecords"
    | "MX.typeOfOccurrenceUncertain"
    | "MX.typeOfOccurrenceSpontaneousOldResident"
    | "MX.typeOfOccurrenceSpontaneousNewResident"
    | "MX.typeOfOccurrenceAlienOldResident"
    | "MX.typeOfOccurrenceSpontaneousNewEphemeral"
    | "MX.typeOfOccurrenceSpontaneousNewEphemeralOnlyOld"
    | "MX.typeOfOccurrenceSpontaneousOldFormerlyResidentPossiblyExtinct"
    | "MX.typeOfOccurrenceSpontaneousOldFormerlyResidentExtinct"
    | "MX.typeOfOccurrenceAlienNewEphemeral"
    | "MX.typeOfOccurrenceAlienNewEphemeralOnlyold"
    | "MX.typeOfOccurrenceAlienNewResident"
    | "MX.typeOfOccurrenceAlienOldFormerlyResidentPossiblyExtinct"
    | "MX.typeOfOccurrenceAlienOldExtinct"
    | "MX.typeOfOccurrenceSmallDegreeCultivatedOrigin"
    | "MX.typeOfOccurrenceNotableDegreeCultivatedOrigin"
    | "MX.typeOfOccurrenceCompletelyCultivatedOrigin"
    | "MX.typeOfOccurrenceOnlyCultivated"
    | "MX.typeOfOccurrenceMaxShortDistanceEscape"
    | "MX.typeOfOccurrenceMaxSoilImmigrant"
    | "MX.typeOfOccurrenceMaxReplanted"
    | "MX.typeOfOccurrenceMaxRelict"
    | "MX.typeOfOccurrenceNotEvaluated"
    | "MX.typeOfOccurrenceRegularBreeder"
    | "MX.typeOfOccurrenceIrregularBreeder"
    | "MX.typeOfOccurrencePassageMigrant"
    | "MX.typeOfOccurrenceBirdLifeCategoryA"
    | "MX.typeOfOccurrenceBirdLifeCategoryB"
    | "MX.typeOfOccurrenceBirdLifeCategoryC"
    | "MX.typeOfOccurrenceBirdLifeCategoryD"
    | "MX.typeOfOccurrenceBirdLifeCategoryE"
    | "MX.typeOfOccurrenceOccursBasedOnOccurrences";
  taxon: string;
  threatened?: boolean;
  year?: string;
}
