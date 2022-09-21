/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Notification {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  annotation?: {
    id?: string;
    "@type"?: string;
    "@context"?: string;
    addedTags?: string[];
    annotationByPerson?: string;
    annotationBySystem?: string;
    annotationClass?:
      | ""
      | "MAN.annotationClassReliable"
      | "MAN.annotationClassLikely"
      | "MAN.annotationClassNeutral"
      | "MAN.annotationClassSuspicious"
      | "MAN.annotationClassUnreliable"
      | "MAN.annotationClassAcknowledged"
      | "MAN.annotationClassSpam";
    byRole?: "" | "MMAN.expert" | "MMAN.basic" | "MMAN.owner" | "MMAN.formAdmin" | "MMAN.ictAdmin";
    censusAnnotation?: ("" | "MAN.countError" | "MAN.innerCountError" | "MAN.otherError")[];
    created?: string;
    createdTimestamp?: number;
    deletedTimestamp?: number;
    identification?: {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      "herbo:sortOrder"?: number;
      /**
       * Write associated observation taxa names here, separated by a semicolon (;). E.g.: "Betula pendula; Betula pubescens; Poaceae". These will form their own units of the type observation.
       */
      associatedObservationTaxa?: string;
      /**
       * Author for the taxon
       */
      author?: string;
      /**
       * Name of the identifier (person) preferably in format "lastname, firstname"
       */
      det?: string;
      /**
       * Date or year when the identification was done, preferably in format "d.m.Y" or  "Y"
       */
      detDate?: string;
      detMethod?: "" | "MY.detMethodFreshSample" | "MY.detMethodMicroscopy" | "MY.detMethodPhoto";
      /**
       * Name of the identifier and date of identification in original format (e.g. from the label), errors and all
       */
      detVerbatim?: string;
      /**
       * Additional qualifier or specifier at genus level (e.g. aff., cf.)
       */
      genusQualifier?: string;
      identificationBasis?: (
        | ""
        | "MY.identificationBasisSeen"
        | "MY.identificationBasisHeard"
        | "MY.identificationBasisHandled"
        | "MY.identificationBasisMedia"
        | "MY.identificationBasisFreshSpecimen"
        | "MY.identificationBasisPreservedSpecimen"
        | "MY.identificationBasisMicroscope"
        | "MY.identificationBasisSpores"
        | "MY.identificationBasisChemical"
        | "MY.identificationBasisGenitals"
        | "MY.identificationBasisGenitalPreparate"
        | "MY.identificationBasisDNA"
      )[];
      /**
       * Additional information on the identification, basis or such
       */
      identificationNotes?: string;
      /**
       * Author for the taxon below species level/infra epithet
       */
      infraAuthor?: string;
      /**
       * Taxon name for the epithet below species level
       */
      infraEpithet?: string;
      /**
       * Taxonomic level of the epithet below species level
       */
      infraRank?:
        | ""
        | "MY.infraRankSsp"
        | "MY.infraRankVar"
        | "MY.infraRankBeta"
        | "MY.infraRankB"
        | "MY.infraRankForma"
        | "MY.infraRankHybrid"
        | "MY.infraRankAnamorph"
        | "MY.infraRankAggregate"
        | "MY.infraRankAberration"
        | "MY.infraRankCultivar"
        | "MY.infraRankMorpha"
        | "MY.infraRankUnknown"
        | "MY.infraRankNothosubspecies"
        | "MY.infraRankCultivarGroup";
      /**
       * Pathovars, serovars and other infrasubspecific subdivisions of microbes.
       */
      infrasubspecificSubdivision?: string;
      /**
       * Which parent or larger collection this is part of.
       */
      isPartOf?: string;
      isTaxonGroup?: boolean;
      /**
       * This can be used to select one of the identifications as 'recommended', which is the used as default when displaying information about the specimen.
       */
      preferredIdentification?: string;
      /**
       * Publication reference for the taxon concept, that was used in identification
       */
      sec?: string;
      /**
       * Additional qualifier at species level (e.g. aff., cf., sp. n., coll.)
       */
      speciesQualifier?: string;
      /**
       * Taxon name
       */
      taxon?: string;
      /**
       * ID for the taxon if has some other than an MX code
       */
      taxonID?: string;
      /**
       * Taxonomic level for the identification
       */
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
      taxonSpecifier?: string;
      taxonURI?: string;
      /**
       * Taxon name in original format (e.g. from the label), errors and all
       */
      taxonVerbatim?: string;
      /**
       * PUBLIC: all data can be published; PROTECTED: exact locality is hidden (100*100km square); PRIVATE: most of the data is hidden. Empty value means same as public.
       */
      publicityRestrictions?:
        | ""
        | "MZ.publicityRestrictionsPublic"
        | "MZ.publicityRestrictionsProtected"
        | "MZ.publicityRestrictionsPrivate";
      sortOrder?: number;
    };
    invasiveControlEffectiveness?:
      | ""
      | "MY.invasiveControlEffectivenessFull"
      | "MY.invasiveControlEffectivenessPartial"
      | "MY.invasiveControlEffectivenessNone"
      | "MY.invasiveControlEffectivenessNotFound";
    lineTransectAnnotation?: ("" | "MAN.birdCountError" | "MAN.innerCountError" | "MAN.otherError")[];
    notes?: string;
    occurrenceAtTimeOfAnnotation?: {
      countryVerbatim?: string;
      dateBegin?: string;
      dateEnd?: string;
      locality?: string;
      municipalityVerbatim?: string;
      taxonId?: string;
      taxonVerbatim?: string;
      wgs84centerPointLat?: number;
      wgs84centerPointLon?: number;
    };
    opinion?: string;
    removedTags?: string[];
    rootID?: string;
    targetID?: string;
    type?: "" | "MAN.typeOpinion" | "MAN.typeInvasiveControlEffectiveness" | "MAN.typeUnidentifiable" | "MAN.typeAdmin";
    createdBySystem?: string;
    deleted?: boolean;
    deletedByPerson?: string;
    deletedDateTime?: string;
  };
  created: string;
  friendRequest?: string;
  friendRequestAccepted?: string;
  notificationReason?:
    | ""
    | "MHN.notificationReasonOwnDocumentAnnotated"
    | "MHN.notificationReasonAnnotatedDocumentAnnotated";
  seen?: boolean;
  toPerson: string;
}
