/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface SubUnit {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Estimated or known age in calendar years, years, days or other relevant unit.
   */
  age?: string;
  individualCount?: number;
  /**
   * Sex of the individual(s)
   */
  sex?: "" | "MY.sexM" | "MY.sexF" | "MY.sexW" | "MY.sexU" | "MY.sexN" | "MY.sexX" | "MY.sexE" | "MY.sexC";
}
