/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface UnitGathering {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  dateBegin?: string;
  dateEnd?: string;
  geometry?: {
    [k: string]: unknown | undefined;
  };
  /**
   * Informal description of the habitat.
   */
  habitatDescription?: string;
  habitatIUCN?: string;
  /**
   * Type of substrate or name of substrate species.
   */
  substrate?: string;
}
