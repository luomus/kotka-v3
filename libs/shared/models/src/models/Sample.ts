/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Sample {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Name of the instrument or device used for DNA extraction
   */
  DNAExtractionInstrument?: string;
  /**
   * Other identifiers this preparation/sample has, in format 'type:identifier'. For example: 'MZHtissue:123'. You can enter the type and colon and then click 'generate' to fetch the next free number for that prefix type.
   */
  additionalIDs?: string[];
  /**
   * BOLD ID (usually BOLD "Sample ID") for the preparation/sample. If no other preparation/sample information is entered, use the BOLD field on the document level
   */
  bold?: string;
  /**
   * The collection which this preparation/sample belongs to, if different from the collection of the specimen.
   */
  collectionID?: string;
  /**
   * Notes on the defects of the preparation/sample (missing parts or such). For specimen level status use the condition field in the basic information section (document level). Empty value means same as "good" or "hyvä" - that the sample is in fine condition.
   */
  condition?: string;
  /**
   * Datasets for the preparation/sample. For specimen level datasets, use the dataset field in the basic information section (document level).
   */
  datasetID?: string[];
  /**
   * DNA sample elution medium
   */
  elutionMedium?: "" | "MF.elutionMediumUltrapureWater" | "MF.elutionMediumElutionBuffer";
  /**
   * Diary-style information about what has been done to the preparation/sample
   */
  event?: string[];
  /**
   * Genbank ID for the preparation/sample. If no other preparation/sample information is entered, use the Genbank field on the document level
   */
  genbank?: string[];
  /**
   * For example a jar that contains multiple fish individuals can be recorded as one specimen and one preparation. Can also be used for DNA samples (was DNA extracted from single or multiple individuals?).
   */
  individualsInPreparation?: "" | "MF.individualsInPreparationMultiple" | "MF.individualsInPreparationSingle";
  /**
   * Preparation/sample material. Choose preparation/sample type first.
   */
  material?:
    | ""
    | "MF.materialBirdStudySkin"
    | "MF.materialWing"
    | "MF.materialTail"
    | "MF.materialWingAndTail"
    | "MF.materialSkull"
    | "MF.materialEntireSkeleton"
    | "MF.materialBones"
    | "MF.materialSkullAndBones"
    | "MF.materialAntlers"
    | "MF.materialHead"
    | "MF.materialMuscle"
    | "MF.materialLiver"
    | "MF.materialLeaf"
    | "MF.materialBlood"
    | "MF.materialLeg"
    | "MF.materialSkin"
    | "MF.materialFeather"
    | "MF.materialEgg"
    | "MF.materialEggContent"
    | "MF.materialGenomicDNA"
    | "MF.materialMitochondrialDNA"
    | "MF.materialChloroplastDNA"
    | "MF.materialEnvironmentalDNA"
    | "MF.materialTeeth"
    | "MF.materialBodyParts"
    | "MF.materialEntireOrganism"
    | "MF.materialAppendages"
    | "MF.materialGenitalPreparation"
    | "MF.materialSection"
    | "MF.materialChromosomes"
    | "MF.materialShell"
    | "MF.materialOther";
  /**
   * Additional information about the preparation/sample
   */
  notes?: string;
  /**
   * Type of preparation/sample
   */
  preparationType:
    | "MF.preparationTypeSkin"
    | "MF.preparationTypeSkeletal"
    | "MF.preparationTypeMount"
    | "MF.preparationTypeTissue"
    | "MF.preparationTypeTissueEcotoxicology"
    | "MF.preparationTypeLiquid"
    | "MF.preparationTypeMicroscopeSlide"
    | "MF.preparationTypeDNAExtract"
    | "MF.preparationTypeOther";
  /**
   * Preservation methods and materials of the preparation/sample. It is possible to choose several
   */
  preservation?: (
    | ""
    | "MY.preservationPressed"
    | "MY.preservationDry"
    | "MY.preservationCriticalPointDrying"
    | "MY.preservationPinned"
    | "MY.preservationGlued"
    | "MY.preservationLiquid"
    | "MY.preservationEthanol"
    | "MY.preservationEthanolPure"
    | "MY.preservationEthanol70"
    | "MY.preservationEthanol80"
    | "MY.preservationEthanol80Pure"
    | "MY.preservationEthanol96"
    | "MY.preservationEthanolDenatured"
    | "MY.preservationEthanolFormalin"
    | "MY.preservationEthanolExFormalin"
    | "MY.preservationFormalin"
    | "MY.preservationBouinSolution"
    | "MY.preservationPampelsFluid"
    | "MY.preservationGlycerol"
    | "MY.preservationParaffin"
    | "MY.preservationMercuricChloride"
    | "MY.preservationCryopreserved"
    | "MY.preservationFrozen"
    | "MY.preservationFrozenMinus80C"
    | "MY.preservationFreezeDried"
    | "MY.preservationGoldPlated"
    | "MY.preservationActiveCulture"
    | "MY.preservationLiving"
    | "MY.preservationSlide"
    | "MY.preservationSlideCanadaBalsam"
    | "MY.preservationSlideEuparal"
    | "MY.preservationSlidePolyviol"
    | "MY.preservationStuffed"
    | "MY.preservationCast"
    | "MY.preservationPlastinated"
    | "MY.preservationFrozenMinus80CAndEthanolMinus20C"
  )[];
  /**
   * Publication references or doi's that refer to this preparations/sample. For publications referring to the specimen, use publications field in the Other section (document level).
   */
  publication?: string[];
  /**
   * DNA sample quality on a three step scale. The quality is defined by quality check measurements
   */
  quality?: "" | "MF.qualityLow" | "MF.qualityMedium" | "MF.qualityHigh";
  /**
   * Date of the latest quality check measurements
   */
  qualityCheckDate?: string;
  /**
   * Method or instrument used for quality measurements
   */
  qualityCheckMethod?: ("" | "MF.qualityCheckMethodNanoDrop" | "MF.qualityCheckMethodCubit")[];
  /**
   * Additional information about the DNA sample quality
   */
  qualityNotes?: string;
  /**
   * Location of the preparation/sample so that museum personnel can find it. E.g. room, freezer, shelf number etc.
   */
  sampleLocation?: string;
  specimenID: string;
  /**
   * Status of the preparation/sample. For specimen level status use the status field in the basic information section. Empty value means same as "ok" - that there is nothing special about the status of the sample.
   */
  status?:
    | ""
    | "MY.statusOk"
    | "MY.statusMissing"
    | "MY.statusUnrecoverable"
    | "MY.statusLost"
    | "MY.statusDonated"
    | "MY.statusDeposited"
    | "MY.statusDeaccessioned"
    | "MY.statusDiscarded"
    | "MY.statusSpent"
    | "MY.statusDestroyed"
    | "MY.statusUndefined"
    | "MY.statusAxenic"
    | "MY.statusNonAxenic"
    | "MY.statusNotAvailable"
    | "MY.statusDead"
    | "MY.statusNoVoucherRetained";
  /**
   * Which parent or larger collection this is part of.
   */
  isPartOf?: string;
  /**
   * For measurements taken from the preparation/sample, use the measurement field in the preparation/sample section. For measurements taken from the specimen, use the measurements field on unit level.
   */
  measurement?: {
    DNAConcentrationNgPerMicroliter?: number[];
    DNARatioOfAbsorbance260And280?: number[];
    DNAVolumeMicroliters?: number[];
    beakMillimeters?: number[];
    bodyCentimeters?: number[];
    bodyMillimeters?: number[];
    earLengthMillimeters?: number[];
    embryoCount?: number[];
    follicleDiameterMillimeters?: number[];
    footLengthMillimeters?: number[];
    forearmMillimeters?: number[];
    gonadMillimeters?: number[];
    /**
     * Which parent or larger collection this is part of.
     */
    isPartOf?: string;
    tailCentimeters?: number[];
    tailMillimeters?: number[];
    tarsusLengthMillimeters?: number[];
    totalLengthCentimeters?: number[];
    totalLengthMillimeters?: number[];
    uterineScarCount?: number[];
    weightGrams?: number[];
    weightKilograms?: number[];
    wingMaxMillimeters?: number[];
    wingMillimeters?: number[];
    wingMinMillimeters?: number[];
  };
  creator?: string;
  dateCreated?: string;
  dateEdited?: string;
  editor?: string;
  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;
}
