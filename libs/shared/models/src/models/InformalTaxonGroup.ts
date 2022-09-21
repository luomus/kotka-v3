/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface InformalTaxonGroup {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * If this is true, the group is considered a root even if it has parents. For example Fishes is part of Water animals but still is wanted to be a root by itself.
   */
  explicitlyDefinedRoot?: boolean;
  hasSubGroup?: string[];
  name: {
    en?: string;
    fi?: string;
    sv?: string;
  };
}
