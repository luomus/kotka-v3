import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const SHARDS = 5;
export const REPLICAS = 0;

export interface ExtractorInterface {
  addToBulk(document: any, bulk: BulkRequest, parent?: any): Promise<void>;
  getMapping(): MappingTypeMapping;
  getSettings(): IndicesIndexSettingsKeys;
  getIndex(type?: string): string;
  getRelatedExtracts(): ExtractorInterface[];
}
