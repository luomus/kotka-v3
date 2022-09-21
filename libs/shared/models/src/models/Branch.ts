/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface Branch {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  accessionID: string;
  /**
   * Garden area
   */
  collectionID: string;
  /**
   * Is the branch alive or not?
   */
  exists?: boolean;
  /**
   * Sublocation within the garden area, free-text
   */
  location?: string;
  notes?: string;
}
