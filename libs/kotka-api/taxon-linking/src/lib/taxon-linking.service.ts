import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { MXTaxonRankEnum } from '@luomus/laji-schema/models';
import { TaxonExtractorService } from './taxon-extractor.service';
import { EsClientService } from '@kotka/api/elasticsearch';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import { Cached, CacheService } from '@kotka/api/cache';

const TAXON_NOT_FOUND = 'TAXON_NOT_FOUND';

export interface TaxonName {
  scientificName: string;
  author?: string;
}

export interface LinkableTaxon {
  scientificName: string;
  author?: string;
  id: string;
  synonyms?: TaxonName[];
  checklistId: string;
  taxonRank: MXTaxonRankEnum;
  finnsh: boolean;
  sensitive: boolean;
  kingdom?: TaxonName;
  phylum?: TaxonName;
  class?: TaxonName;
  family?: TaxonName;
  species?: TaxonName;
  names: string[];
}

@Injectable()
export class TaxonLinkingService {
  constructor (
    private readonly httpService: HttpService,
    private readonly taxonExtractorService: TaxonExtractorService,
    private readonly esClientService: EsClientService,
    private readonly cacheService: CacheService
  ) {}

  public async updateTaxonLinking(batchSize: number = 1000) {
    const taxonString = await lastValueFrom(this.httpService.get<string>(process.env['TAXON_LINKING_URL']!).pipe(map(response => response.data)));

    let lineStart = 0;
    let lineEnd = taxonString.indexOf('\n');
    let cnt = 0;
    let batchCnt = 0
    let bulk: BulkRequest = {};

    await this.esClientService.prepareIndex(this.taxonExtractorService);

    while (lineEnd > 0) {
      const line = taxonString.substring(lineStart, lineEnd);

      const taxon = JSON.parse(line);

      await this.taxonExtractorService.addToBulk(taxon, bulk);

      batchCnt = bulk.body?.length ? bulk.body?.length / 2 : 0;

      if (batchCnt >= batchSize) {
        cnt += batchCnt;
        await this.esClientService.indexBulk(bulk);
        bulk = {}
      }

      lineStart = lineEnd + 1;
      lineEnd = taxonString.indexOf('\n', lineStart);
    }

    if (bulk.body?.length) {
      cnt += batchCnt;
      await this.esClientService.indexBulk(bulk);
    }

    return cnt;
  }

  public async getTaxonCached(name: string, author?: string, taxonRank?: MXTaxonRankEnum): Promise<LinkableTaxon[] | undefined> {
    const cacheKey = `taxon_${name}` + (author ? `_${author}` : '') + (taxonRank ? `_${taxonRank}` : '');

    const taxon = await this.cacheService.getValue(cacheKey, '1h', async () => {
      const taxon = await this.getTaxon(name, author, taxonRank);

      if (!taxon || taxon.length === 0) {
        return TAXON_NOT_FOUND;
      }
      return taxon;
    });

    return taxon === TAXON_NOT_FOUND ? undefined : taxon;
  }

  public async getTaxon(name: string, author?: string, taxonRank?: MXTaxonRankEnum): Promise<LinkableTaxon[] | undefined> {
    let taxonSearchQuery: any;

    if (name.indexOf('MX.') === 0) {
      taxonSearchQuery = {
        match: {
          id: name
        }
      };
    } else {
      taxonSearchQuery = {
        nested: {
          path: 'taxonSearch',
          query: {
            bool: {
              must: [
                { match: { 'taxonSearch.scientificName': name }}
              ]
            }
          }
        }
      };

      if (author) {
        taxonSearchQuery.nested.query.bool.should = [{ match: { 'taxonSearch.author': author }}];
      }
    }

    const query: any = {
      bool: {
        must: [taxonSearchQuery]
      }
    };

    if (taxonRank) {
      query.bool.must.push({ match: { taxonRank } });
    }

    const result = await this.esClientService.searchQuery(this.taxonExtractorService.getIndex(), query);
    return result?.hits?.hits?.map(hit => hit._source) as LinkableTaxon[];
  }
}
