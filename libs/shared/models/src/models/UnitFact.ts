/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface UnitFact {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  adultIndividualCount?: number;
  autocompleteSelectedTaxonID?: string;
  glowWormMicrohabitat?:
    | ""
    | "MY.glowWormMicrohabitatEnum1"
    | "MY.glowWormMicrohabitatEnum2"
    | "MY.glowWormMicrohabitatEnum3"
    | "MY.glowWormMicrohabitatEnum4"
    | "MY.glowWormMicrohabitatEnum5"
    | "MY.glowWormMicrohabitatEnum6"
    | "MY.glowWormMicrohabitatEnumOther";
  individualCountFlock?: number;
  individualCountInner?: number;
  individualCountOuter?: number;
  juvenileIndividualCount?: number;
  lineTransectObsType?:
    | ""
    | "MY.lineTransectObsTypeSong"
    | "MY.lineTransectObsTypeOtherSound"
    | "MY.lineTransectObsTypeSeen"
    | "MY.lineTransectObsTypeSeenMale"
    | "MY.lineTransectObsTypeSeenFemale"
    | "MY.lineTransectObsTypeFlyingOverhead"
    | "MY.lineTransectObsTypeFlock"
    | "MY.lineTransectObsTypeFlockFlyingOverhead"
    | "MY.lineTransectObsTypeSeenPair"
    | "MY.lineTransectObsTypeSeenBrood"
    | "MY.lineTransectObsTypeSeenNest"
    | "MY.lineTransectObsTypeUnknown";
  lineTransectRouteFieldType?: "" | "MY.lineTransectRouteFieldTypeInner" | "MY.lineTransectRouteFieldTypeOuter";
  lolifeDroppingsCount?: "" | "MY.lolifeDroppingsCount1" | "MY.lolifeDroppingsCount2" | "MY.lolifeDroppingsCount3";
  lolifeDroppingsQuality?: "" | "MY.lolifeDroppingsQuality1" | "MY.lolifeDroppingsQuality2";
  lolifeDroppingsType?:
    | ""
    | "MY.lolifeDroppingsTypeRock"
    | "MY.lolifeDroppingsTypeTree"
    | "MY.lolifeDroppingsTypeTreeGroup"
    | "MY.lolifeDroppingsTypeOther";
  lolifeNestTree?:
    | ""
    | "MX.38590"
    | "MX.37812"
    | "MX.37999"
    | "MX.37993"
    | "MX.38010"
    | "MX.38008"
    | "MY.lolifeNestTreeOther";
  pairCountInner?: number;
  pairCountOuter?: number;
  pointCountFlock?: string;
  runningWaterInVicinity?: boolean;
  waterbirdFemale?:
    | ""
    | "MY.waterbirdFemaleEnumYes"
    | "MY.waterbirdFemaleEnumNo"
    | "MY.waterbirdFemaleEnumLonelyPanicking";
  waterbirdJuvenileAgeClass?:
    | ""
    | "MY.waterbirdJuvenileAgeClassIa"
    | "MY.waterbirdJuvenileAgeClassIb"
    | "MY.waterbirdJuvenileAgeClassIc"
    | "MY.waterbirdJuvenileAgeClassIIa"
    | "MY.waterbirdJuvenileAgeClassIIb"
    | "MY.waterbirdJuvenileAgeClassIIc"
    | "MY.waterbirdJuvenileAgeClassIIIa"
    | "MY.waterbirdJuvenileAgeClassUnknown";
  waterbirdJuvenileCountAccurate?: boolean;
  waterbirdObserverOpinionSelectedCensus?: boolean;
  waterbirdPairCountOpinionReasoning?:
    | ""
    | "MY.waterbirdPairCountOpinionReasoningEnum1"
    | "MY.waterbirdPairCountOpinionReasoningEnum2"
    | "MY.waterbirdPairCountOpinionReasoningEnum3"
    | "MY.waterbirdPairCountOpinionReasoningEnumOther";
  individualCountBiotopeA?: number;
  individualCountBiotopeB?: number;
  individualCountBiotopeC?: number;
  individualCountBiotopeD?: number;
  individualCountBiotopeE?: number;
  individualCountBiotopeF?: number;
  individualCountBiotopeG?: number;
  individualCountBiotopeH?: number;
}
