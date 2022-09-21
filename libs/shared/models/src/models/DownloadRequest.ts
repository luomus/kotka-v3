/* tslint:disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run the command to regenerate this file.
 */

export interface DownloadRequest {
  "@context"?: string;
  id?: string;
  "@type"?: string;
  apiKeyExpires?: string;
  approximateResultSize: number;
  collectionId?: string[];
  completed: boolean;
  created?: string;
  createdFile?: string;
  createdFileSize?: string;
  dataUsePurpose?: string;
  downloadFormat?: string;
  downloadInclude?: string[];
  downloadType: string;
  downloaded?: string[];
  email?: string;
  failed?: boolean;
  failureReason?: string;
  filter: [string, ...string[]];
  locale?: string;
  person?: string;
  requested: string;
  source: string;
  warehouse: string;
}
