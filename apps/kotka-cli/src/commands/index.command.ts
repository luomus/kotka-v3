import { LajiStoreService } from '@kotka/api/services';
import { EsClientService } from '@kotka/api/elasticsearch';
import { SpecimenSearchService } from '@kotka/api/specimen-search';
import { Command, Console } from 'nestjs-console';
import { lastValueFrom, map } from 'rxjs';
import { KotkaObjectFullType, Document, specimenIndices, indices, ElasticIndex } from '@kotka/shared/models';
import ora from 'ora';
import { getId } from '@kotka/shared/utils';

interface Options {
  batch: number
}

@Console()
export class IndexCommand {
  constructor (
    private readonly esClientService: EsClientService,
    private readonly specimenSearchService: SpecimenSearchService,
    private readonly lajiStoreService: LajiStoreService,
  ) {}

  @Command({
    command: 'index-specimens [id]',
    description: 'Index specimens from laji-store, either all or by optional comma separated URI or QName id(s) list',
    options: [
      {
        flags: '-b, --batch <batch>',
        description: 'Size of reindex batch.',
        defaultValue: 100,
        required: false
      },
    ],
  })
  async indexData(id: string, options: Options) {
    const ids = id?.split(',').map(id => getId(id));
    const batch = options.batch;
    let count = 0;
    let countMismatch = false;

    const spin = ora();
    spin.start('Indexing...');

    try {
      let stop = false;
      if (ids?.length === 1) {
        spin.text = `Indexing (0/${ids.length})...`;

        try {
          const result = await lastValueFrom(this.lajiStoreService.get<Document>(KotkaObjectFullType.document, id).pipe(map(res => res.data)));

          const esResponse = await this.specimenSearchService.indexSingle(result);

          if (esResponse.errors) {
            spin.fail('Error indexing document!');
            console.error('Error: ', esResponse.items[0]);
          }
          count++;
        } catch (err) {
          if (err.response?.status === 404) {
            spin.warn(`No document found with id: ${id}`);
            return;
          } else {
            throw err;
          }
        }

      } else {
        let page = 1;
        do {
          const results = await lastValueFrom(this.lajiStoreService.getAll<Document>(KotkaObjectFullType.document, { q: ids ? `id:(${ids.join(' OR ')})` : undefined, page_size: batch, page }).pipe(map(res => res.data)));

          if (results.totalItems === 0) {
            spin.warn('No documents found to index');
            break;
          }

          if (page === 0 && ids && ids?.length > results.totalItems) {
            countMismatch = true;
          }

          const esResponse = await this.specimenSearchService.indexMany(results.member);

          if (esResponse.errors) {
            console.error('Errors: ', esResponse.items.filter(item => item.index.error).map(item => item.index.error));
            spin.fail('Error indexing documents!');
            break;
          }

          count += results.member.length;
          spin.text = `Indexing (${count}/${ids?.length || results.totalItems})...`;

          if (results.lastPage === page) {
            stop = true;
          }

          page++;

        } while (!stop);
      }
    } catch (err) {
      console.error(err);
      spin.fail('Indexing error!');
      return;
    }

    spin.succeed(`Indexing completed, indexed ${count} item(s)${countMismatch ? ` (expected ${ids.length} from given ids)` : ''}`);
  }

  @Command({
    command: 'index-specimen-delete <id>',
    description: 'Delete specimens from the index by comma-separated URI:s or QNames',
  })
  async indexSpecimenDelete(id: string) {
    const ids = this.mapIds(id.split(','));
    const spin = ora();

    spin.start('Deleting specimens...');

    try {
      const res = await this.specimenSearchService.deleteByDocumentQName(ids);

      if (res.failures && res.failures.length > 0) {
        spin.warn(`Failed to delete some specimens: ${res.failures.join(', ')}`);
      } else {
        spin.succeed('Specimens deleted.');
      }
    } catch (err) {
      console.error(err);
      spin.fail('Error deleting specimens!');
    }
  }

  @Command({
    command: 'drop-specimen-indices',
    description: 'Drop specimen indices from the search service',
  })
  async removeSpecimenIndices() {
    const spin = ora();

    spin.start('Dropping specimen indices...');

    try {
      await this.esClientService.deleteIndex(specimenIndices);
      spin.succeed('Specimen indices dropped.');
    } catch (err) {
      console.error(err);
      spin.fail('Error dropping specimen indices!');
    }
  }

  @Command({
    command: 'drop-index <index>',
    description: 'Drop a index.',
  })
  async dropIndex(index: ElasticIndex) {
    const spin = ora();

    spin.start(`Dropping index ${index}...`);

    if (!indices.includes(index as any)) {
      spin.fail(`Index ${index} is not a valid index!`);
      return;
    }

    try {
      await this.esClientService.deleteIndex(index);
      spin.succeed(`Index ${index} dropped.`);
    } catch (err) {
      console.error(err);
      spin.fail(`Error dropping index ${index}!`);
    }
  }

  mapIds(ids: string[]) {
    return ids.map(id => getId(id).replace(':', '\\:'));
  }
}
