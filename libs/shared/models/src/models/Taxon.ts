/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Taxon {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  "herbo:sortOrder"?: number;
  /**
   * <p>Lisämerkinnät:</p>
   * <ul>
   * <li><b>v - vanhat metsät</b> (myös yksittäiset vanhat puut ja runsaasti lahopuuta sisältävät nuoremmat metsät)</li>
   * <li><b>h - harjumetsät</b>, myös puoliavoimet</li>
   * <li><b>p - metsäpaloalueet</b> ja muut luontaisen sukkession alkuvaiheen metsät</li>
   * <li><b>j - jalopuuesiintymä</b></li>
   * <li><b>pa - paahteinen</b></li>
   * <li><b>va - varjoinen</b></li>
   * <li><b>ra - sijaitsee rannalla</b> (lajin esiintyminen on sidoksissa rannan läheisyyteen)</li>
   * <li><b>ka - karut kalliot ja kivikot</b></li>
   * <li><b>ke - keskiravinteiset kalliot ja kivikot</b></li>
   * <li><b>ca - kalkkivaikutteinen</b></li>
   * </ul>
   */
  primaryHabitat?: string;
  secondaryHabitat?: string[];
  /**
   * Identifier of this taxon concept/name in other systems/sources
   */
  additionalID?: string[];
  /**
   * Leväosakkaiden kuvaus
   */
  algalPartnerOfLichen?: string;
  /**
   * Names used in observations that are linked to taxonomy. (Eg names used in special cases and informal and slang names.)
   */
  alsoKnownAs?: string[];
  /**
   * Commonly used names. (Eg names used in recent literature.)
   */
  alternativeVernacularName?: {
    en?: string[];
    fi?: string[];
    sv?: string[];
  };
  /**
   * Lajin elintavat
   */
  behaviour?: string;
  birdlifeCode?: string;
  breedingSecureLevel?:
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
  circumscription?: string;
  /**
   * Informal but commonly used name. Name that is outdated, unofficial or non-recommended, but which is still commonly used for this taxon.
   */
  colloquialVernacularName?: {
    en?: string[];
    fi?: string[];
    sv?: string[];
  };
  conservationStatusDescriptionFinland?: string;
  conservationStatusDescriptionWorld?: string;
  cultivationText?: string;
  customReportFormLink?: string;
  /**
   * Käpyjen kuvaus
   */
  descriptionCone?: string;
  /**
   * Kukan kuvaus
   */
  descriptionFlower?: string;
  /**
   * Hedelmän/siemenen -kuvaus
   */
  descriptionFruitAndSeed?: string;
  /**
   * Itiöemän kuvaus
   */
  descriptionFruitbody?: string;
  descriptionHostParasite?: string;
  /**
   * Lehden kuvaus
   */
  descriptionLeaf?: string;
  /**
   * Lajin mikroskooppiset tuntomerkit
   */
  descriptionMicroscopicIdentification?: string;
  /**
   * Eliön koon kuvaus
   */
  descriptionOrganismSize?: string;
  descriptionReferences?: string;
  descriptionRoot?: string;
  /**
   * Itiöpesäkkeet ja suvuton lisääntyminen
   */
  descriptionSporangiumAndAsexualReproduction?: string;
  /**
   * Itiöiden kuvaus
   */
  descriptionSpore?: string;
  /**
   * Kasvin varren kuvaus
   */
  descriptionStem?: string;
  descriptionText?: string;
  /**
   * Sekovarren kuvaus
   */
  descriptionThallus?: string;
  descriptionToxicity?: string;
  distributionFinland?: string;
  distributionMapFinland?: string;
  /**
   * Lajin ekologian sekalainen kuvaus
   */
  ecology?: string;
  economicUseText?: string;
  etymologyText?: string;
  euringCode?: string;
  euringNumber?: string;
  externalLinkURL?: string;
  finnish?: boolean;
  frequencyScoringPoints?: number;
  growthFormAndGrowthHabit?: string;
  /**
   * Lajin elinympäristö
   */
  habitat?: string;
  /**
   * Lajin kasvialusta
   */
  habitatSubstrate?: string;
  hasAdminStatus?: (
    | ""
    | "MX.finlex160_1997_appendix4_2021"
    | "MX.finlex160_1997_appendix4_specialInterest_2021"
    | "MX.finlex160_1997_appendix1"
    | "MX.finlex160_1997_appendix2a"
    | "MX.finlex160_1997_appendix2b"
    | "MX.finlex160_1997_appendix3a"
    | "MX.finlex160_1997_appendix3b"
    | "MX.finlex160_1997_appendix3c"
    | "MX.finlex160_1997_largeBirdsOfPrey"
    | "MX.habitatsDirectiveAnnexII"
    | "MX.habitatsDirectiveAnnexIV"
    | "MX.habitatsDirectiveAnnexV"
    | "MX.primaryInterestInEU"
    | "MX.habitatsDirectiveAnnexIIExceptionGranted"
    | "MX.habitatsDirectiveAnnexII_FinlandNaturaSpecies"
    | "MX.habitatsDirectiveAnnexIVExceptionGranted"
    | "MX.habitatsDirectiveAnnexVExceptionGranted"
    | "MX.birdsDirectiveStatusAppendix1"
    | "MX.birdsDirectiveStatusAppendix2A"
    | "MX.birdsDirectiveStatusAppendix2B"
    | "MX.birdsDirectiveStatusAppendix3A"
    | "MX.birdsDirectiveStatusAppendix3B"
    | "MX.birdsDirectiveStatusMigratoryBirds"
    | "MX.cites_appendixI"
    | "MX.cites_appendixII"
    | "MX.cites_appendixIII"
    | "MX.euRegulation_cites_appendixA"
    | "MX.euRegulation_cites_appendixB"
    | "MX.euRegulation_cites_appendixD"
    | "MX.finnishEnvironmentInstitute2020protectionPrioritySpecies"
    | "MX.finnishEnvironmentInstitute2010protectionPrioritySpecies"
    | "MX.gameBird"
    | "MX.gameMammal"
    | "MX.unprotectedSpecies"
    | "MX.nationallySignificantInvasiveSpecies"
    | "MX.euInvasiveSpeciesList"
    | "MX.quarantinePlantPest"
    | "MX.qualityPlantPest"
    | "MX.otherPlantPest"
    | "MX.nationalInvasiveSpeciesStrategy"
    | "MX.otherInvasiveSpeciesList"
    | "MX.controllingRisksOfInvasiveAlienSpecies"
    | "MX.finnishEnvironmentInstitute20072010forestSpecies"
    | "MX.finnishEnvironmentInstitute2020conservationProjectSpecies"
    | "MX.finnishEnvironmentInstitute2020conservationProjectAapamireSpecies"
    | "MX.finnishEnvironmentInstitute2020conservationProjectVascularSpecies"
    | "MX.cropWildRelative"
    | "MX.finnishEnvironmentInstitute20192021forestSpecies"
    | "MX.finlex160_1997_appendix4"
    | "MX.finlex160_1997_appendix4_specialInterest"
  )[];
  hasAlternativeName?: string[];
  hasBasionym?: string[];
  hasHeterotypicSynonym?: string[];
  hasHomotypicSynonym?: string[];
  hasMisappliedName?: string[];
  hasMisspelledName?: string[];
  hasObjectiveSynonym?: string[];
  hasOrthographicVariant?: string[];
  hasSubjectiveSynonym?: string[];
  hasSynonym?: string[];
  hasUncertainSynonym?: string[];
  /**
   * Should this taxon be hidden when showing contents of a checklist (publicly)?
   */
  hiddenTaxon?: boolean;
  identificationText?: string;
  ingressText?: string;
  invasiveCitizenActionsText?: string;
  invasiveEffectText?: string;
  invasivePreventionMethodsText?: string;
  invasiveSpeciesCategory?: "" | "MX.invasiveExtremelyDangerous" | "MX.invasiveDangerous" | "MX.invasiveWatchlist";
  invasiveSpeciesClassificationDescription?: string;
  invasiveSpeciesEarlyWarning?: boolean;
  invasiveSpeciesEstablishment?:
    | ""
    | "MX.invasiveEstablished"
    | "MX.invasiveSporadic"
    | "MX.invasiveNotYetInFinland"
    | "MX.invasiveEstablishmentUnknown"
    | "MX.invasiveEstablishmentAccidental";
  isPartOf?: string;
  isPartOfInformalTaxonGroup?: string[];
  isPartOfSet?: (
    | ""
    | "MX.taxonSetSykeButterflyCensusPapilionoidea"
    | "MX.taxonSetSykeButterflyCensusOther"
    | "MX.taxonSetWaterbirdWaterbirds"
    | "MX.taxonSetWaterbirdWaders"
    | "MX.taxonSetWaterbirdGulls"
    | "MX.taxonSetWaterbirdPasserines"
    | "MX.taxonSetWaterbirdAmphibia"
    | "MX.taxonSetSykeBumblebee"
    | "MVL.1201"
    | "MX.taxonSetSykeBumblebeeOther"
    | "MX.taxonSetBirdAtlasCommon"
  )[];
  /**
   * Eliön elinkierto
   */
  lifeCycle?: string;
  management?: string;
  miscText?: string;
  nameAccordingTo?: string;
  nameDecidedBy?: string;
  nameDecidedDate?: string;
  naturaAreaSecureLevel?:
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
  nestSiteSecureLevel?:
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
  notes?: string;
  /**
   * Names not recommended and no longer (for a long time) commonly used. (For example, names used in the literature in the 20th century, or names transferred to another taxon.
   */
  obsoleteVernacularName?: {
    en?: string[];
    fi?: string[];
    sv?: string[];
  };
  occurrenceInFinland?:
    | ""
    | "MX.doesNotOccur"
    | "MX.occurrenceInFinlandPublished"
    | "MX.occurrenceInFinlandCollected"
    | "MX.occurrenceInFinlandObserved"
    | "MX.occurrenceInFinlandPublishedUncertain"
    | "MX.occurrenceInFinlandCollectedUncertain"
    | "MX.occurrenceInFinlandObservedUncertain"
    | "MX.occurrenceInFinlandPublishedError"
    | "MX.occurrenceInFinlandPresumed";
  occurrenceInFinlandPublication?: string[];
  occurrenceInFinlandSpecimenURI?: string;
  originAndDistributionText?: string;
  originalDescription?: string;
  originalPublication?: string[];
  overridingTargetName?: string[];
  privateNotes?: string;
  productionText?: string;
  redListStatus2000Finland?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatus2010Finland?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatus2015Finland?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  redListStatus2019Finland?:
    | ""
    | "MX.iucnEX"
    | "MX.iucnEW"
    | "MX.iucnRE"
    | "MX.iucnCR"
    | "MX.iucnEN"
    | "MX.iucnVU"
    | "MX.iucnNT"
    | "MX.iucnLC"
    | "MX.iucnDD"
    | "MX.iucnNA"
    | "MX.iucnNE";
  reproduction?: string;
  /**
   * Kukinta-aika
   */
  reproductionFloweringTime?: string;
  /**
   * Pölytyksen kuvaus
   */
  reproductionPollination?: string;
  scientificName?: string;
  scientificNameAuthorship?: string;
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
  speciesCardAuthors?: string;
  stopInformalTaxonGroupInheritance?: boolean;
  stopOccurrenceInFinlandPublicationInheritance?: boolean;
  stopOriginalPublicationInheritance?: boolean;
  targetName?: string[];
  taxonEditor?: string[];
  taxonExpert?: string[];
  taxonRank?:
    | ""
    | "MX.superdomain"
    | "MX.domain"
    | "MX.kingdom"
    | "MX.subkingdom"
    | "MX.infrakingdom"
    | "MX.superphylum"
    | "MX.phylum"
    | "MX.subphylum"
    | "MX.infraphylum"
    | "MX.superdivision"
    | "MX.division"
    | "MX.subdivision"
    | "MX.infradivision"
    | "MX.superclass"
    | "MX.class"
    | "MX.subclass"
    | "MX.infraclass"
    | "MX.parvclass"
    | "MX.superorder"
    | "MX.order"
    | "MX.suborder"
    | "MX.infraorder"
    | "MX.parvorder"
    | "MX.superfamily"
    | "MX.family"
    | "MX.subfamily"
    | "MX.tribe"
    | "MX.subtribe"
    | "MX.supergenus"
    | "MX.genus"
    | "MX.nothogenus"
    | "MX.subgenus"
    | "MX.section"
    | "MX.subsection"
    | "MX.series"
    | "MX.subseries"
    | "MX.infragenericTaxon"
    | "MX.aggregate"
    | "MX.speciesAggregate"
    | "MX.species"
    | "MX.nothospecies"
    | "MX.infraspecificTaxon"
    | "MX.subspecificAggregate"
    | "MX.subspecies"
    | "MX.nothosubspecies"
    | "MX.variety"
    | "MX.subvariety"
    | "MX.form"
    | "MX.subform"
    | "MX.hybrid"
    | "MX.anamorph"
    | "MX.ecotype"
    | "MX.populationGroup"
    | "MX.intergenericHybrid"
    | "MX.infragenericHybrid"
    | "MX.cultivar"
    | "MX.group"
    | "MX.grex";
  taxonomyText?: string;
  tradeName?: string[];
  typeOfOccurrenceInFinland?: (
    | ""
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
    | "MX.typeOfOccurrenceOccursBasedOnOccurrences"
  )[];
  typeOfOccurrenceInFinlandNotes?: string;
  typeSpecimenURI?: string;
  /**
   * Currently recommended name
   */
  vernacularName?: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  winteringSecureLevel?:
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
  createdAtTimestamp?: string;
  sortOrder?: number;
  "skos:exactMatch"?: string[];
}
