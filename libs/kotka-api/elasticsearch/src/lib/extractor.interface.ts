import { BulkRequest, IndicesIndexSettingsKeys, MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { ElasticIndex } from '@kotka/shared/models';

export const SHARDS = 5;
export const REPLICAS = 0;

export interface ExtractorInterface {
  addToBulk(document: any, bulk: BulkRequest, parent?: any): Promise<undefined | any[]>;
  getMapping(): MappingTypeMapping;
  getSettings(): IndicesIndexSettingsKeys;
  getIndex(type?: string): ElasticIndex;
  getRelatedExtracts(): ExtractorInterface[];
}
