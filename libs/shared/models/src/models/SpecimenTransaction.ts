/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface SpecimenTransaction {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  /**
   * Internationally Recognized Certificate of Compliance. Kotka checks from the ABS Clearing House that the entered IRCC number exists and is valid.
   */
  IRCC?: string;
  /**
   * If you choose "Yes, with restrictions", explain the restrictions in the following field "Rights and obligations".
   */
  availableForGeneticResearch?:
    | ""
    | "HRX.availableForGeneticResearchYes"
    | "HRX.availableForGeneticResearchWithRestrictions"
    | "HRX.availableForGeneticResearchNo";
  awayCount?: number;
  awayIDs?: string[];
  /**
   * For statiscal purposes. The collection where the transaction is directed to. Record transactions directed to different collections as separate transactions if you use this field.
   */
  collectionID?: string;
  /**
   * Select the correspondent organization from a list. If not found on the list, you need to add the new organization first.
   */
  correspondentOrganization?: string;
  /**
   * Name of the corresponding person. If the transaction goes to a private person, write his/her postal address here.
   */
  correspondentPerson?: string;
  correspondentResearcher?: string;
  damagedCount?: number;
  damagedIDs?: string[];
  /**
   * Date when the loan needs to be returned.
   */
  dueDate?: string;
  externalID?: string;
  /**
   * Country where the genetic resource or traditional knowledge was acquired from, provider country, country of origin. List of countries in Kotka is based on ISO 3166 Country Codes -standard and may differ from the country list in ABSCH.
   */
  geneticResourceAcquisitionCountry?: string;
  /**
   * Date when the genetic resource or traditional knowledge was aqcuired.
   */
  geneticResourceAcquisitionDate?: string;
  /**
   * Description of the genetic resource or traditional knowledge (possible identifiers, taxa, number of specimens, region etc.). Instruction source EU DECLARE User manual and QA.
   */
  geneticResourceDescription?: string;
  /**
   * Presence or absence of rights and obligations relating to access and benefit sharing, including rights and obligations regarding subsequent applications and commercialization. Instruction source EU DECLARE user manual and QA.
   */
  geneticResourceRightsAndObligations?: string;
  /**
   * Person or legal entity from whom the user obtained the genetic resources directly, i.e. the previous actor in the value chain. Often a museum or other organization. If a genetic resource is obtained directly from the provider country, the name of the country should be provided. Instruction source EU DECLARE User manual and QA.
   */
  geneticResourceSource?: string;
  /**
   * Choose the type of the genetic resource for statistical and reporting purposes.
   */
  geneticResourceType?:
    | ""
    | "HRX.geneticResourceTypeAnimal"
    | "HRX.geneticResourceTypePlant"
    | "HRX.geneticResourceTypeFungus"
    | "HRX.geneticResourceTypeMicrobe"
    | "HRX.geneticResourceTypeSoil"
    | "HRX.geneticResourceTypeAqua";
  /**
   * Whether the resource has an IRCC number or not. If not, more information needs to be filled in.
   */
  hasIRCC?: boolean;
  incomingReceived?: string;
  incomingReturned?: string;
  /**
   * Private remarks that are shown only in Kotka and not to the corresponding organisation.
   */
  internalRemarks?: string;
  legacyID?: string;
  localHandler?: string;
  /**
   * Responsible person in our museum.
   */
  localPerson?: string;
  /**
   * Responsible person's email in our museum.
   */
  localPersonEmail?: string;
  /**
   * For incoming loans, name of the researcher receiving the loan.
   */
  localResearcher?: string;
  /**
   * Description of the material included in this transaction.
   */
  material?: string;
  missingCount?: number;
  missingIDs?: string[];
  /**
   * In how many parcels was the transaction sent
   */
  numberOfParcels?: string;
  outgoingReturned?: string;
  outgoingSent?: string;
  permits?: {
    id?: string;
    "@type"?: string;
    "@context"?: string;
    permitEndDate?: string;
    permitFile?: string;
    permitNotes?: string;
    permitStartDate?: string;
    permitStatus?: "" | "HRA.permitStatusAvailable" | "HRA.permitStatusNotRequired";
    permitType?:
      | ""
      | "HRA.permitTypePIC"
      | "HRA.permitTypeMAT"
      | "HRA.permitTypeMTA"
      | "HRA.permitCollectingPermit"
      | "HRA.permitTypeExportPermit"
      | "HRA.permitTypeOther"
      | "HRA.permitTypeMemorandumOfUnderstanding";
    /**
     * Which parent or larger collection this is part of.
     */
    isPartOf?: string;
  }[];
  /**
   * Remarks that are shown to both parties of the transaction.
   */
  publicRemarks?: string;
  /**
   * When signed loan receipt was received from the loanee
   */
  receiptReturned?: string;
  /**
   * When loan request, loan, gift or exchange was received here.
   */
  requestReceived?: string;
  /**
   * Are you importing genetic resources, traditional knowledge associated to genetic resources or both?
   */
  resourceImported?: string;
  returnedCount?: number;
  returnedIDs?: string[];
  /**
   * Whether the transaction is closed, outstanding or in process.
   */
  status?: "" | "HRX.statusInProcess" | "HRX.statusOutstanding" | "HRX.statusClosed";
  transactionEvents?: {
    eventDate?: string;
    eventDocumentIDs?: string;
    eventHandler?: string;
    eventNotes?: string;
  }[];
  transportMethod?:
    | ""
    | "HRX.transportMethodPriority"
    | "HRX.transportMethodEconomy"
    | "HRX.transportMethodCourier"
    | "HRX.transportMethodCarried"
    | "HRX.transportMethodOther"
    | "HRX.transportMethodImage";
  /**
   * What kind of transaction this is.
   */
  type:
    | "HRX.typeLoanIncoming"
    | "HRX.typeGiftIncoming"
    | "HRX.typeExchangeIncoming"
    | "HRX.typeLoanOutgoing"
    | "HRX.typeGiftOutgoing"
    | "HRX.typeExchangeOutgoing"
    | "HRX.typeFieldCollection"
    | "HRX.typeImportNotice"
    | "HRX.typeABSNegotiations"
    | "HRX.typeVirtualLoanOutgoing";
  /**
   * Is it e.g. non-human genetic material that is going to be used for genetic research as is defined by the protocol?
   */
  underNagoya?: string;
  creator?: string;
  dateCreated?: string;
  dateEdited?: string;
  editor?: string;
  /**
   * Team or organisation that owns the record and can edit it.
   */
  owner?: string;
}
