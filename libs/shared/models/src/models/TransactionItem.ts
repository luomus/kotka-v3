/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface TransactionItem {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  collectionID?: string;
  itemCount: number;
  itemID?: string;
  itemLabel?: string;
  itemType: "HRAB.itemTypeSpecimen" | "HRAB.itemTypeSpecimenBatch" | "HRAB.itemTypeImage" | "HRAB.itemTypeOther";
  notes?: string;
  status: "HRAB.statusOk" | "HRAB.statusMissing" | "HRAB.statusDamaged";
}
