/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Measurement {
  "@context"?: string;
  id?: string;
  "@type"?: string;
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
}
