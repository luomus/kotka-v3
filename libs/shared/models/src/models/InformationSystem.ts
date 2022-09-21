/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface InformationSystem {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  URI: string;
  allowedDatawarehouseOverridingSourceId?: string[];
  description: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  documentation: string;
  isAllowedToQueryPrivateWarehouse?: boolean;
  isWarehouseSource?: boolean;
  lajiAuthLoginRedirectURI?: string;
  maintainingOrganization: string;
  name: {
    en?: string;
    fi?: string;
    sv?: string;
  };
  personResponsible: string;
  publicity: "KE.inUseByLuomus" | "KE.inPublicUse" | "KE.adminOnly" | "KE.thirdParty";
  state: "KE.productionState" | "KE.developmentState" | "KE.abandonedState";
  transactionApiURL: string;
  type:
    | "KE.webApplication"
    | "KE.webService"
    | "KE.softwareComponent"
    | "KE.program"
    | "KE.database"
    | "KE.hardware"
    | "KE.server"
    | "KE.mobileApp";
}
