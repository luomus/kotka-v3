/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface TransactionEvent {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  eventDate: string;
  eventHandler: string;
  eventType: "HRAA.eventTypeSend" | "HRAA.eventTypeReceive" | "HRAA.eventTypeOther";
  items: [
    {
      id?: string;
      "@type"?: string;
      "@context"?: string;
      collectionID?: string;
      itemCount: number;
      itemID?: string;
      itemLabel?: string;
      itemType: "HRAB.itemTypeSpecimen" | "HRAB.itemTypeSpecimenBatch" | "HRAB.itemTypeImage" | "HRAB.itemTypeOther";
      notes?: string;
      status: "HRAB.statusOk" | "HRAB.statusMissing" | "HRAB.statusDamaged";
    },
    ...{
      id?: string;
      "@type"?: string;
      "@context"?: string;
      collectionID?: string;
      itemCount: number;
      itemID?: string;
      itemLabel?: string;
      itemType: "HRAB.itemTypeSpecimen" | "HRAB.itemTypeSpecimenBatch" | "HRAB.itemTypeImage" | "HRAB.itemTypeOther";
      notes?: string;
      status: "HRAB.statusOk" | "HRAB.statusMissing" | "HRAB.statusDamaged";
    }[]
  ];
  notes?: string;
  numberOfPackages?: number;
  sentBy?:
    | ""
    | "HRAA.sentByPriority"
    | "HRAA.sentByEconomy"
    | "HRAA.sentByCourier"
    | "HRAA.sentByCarried"
    | "HRAA.sentByOther";
}
