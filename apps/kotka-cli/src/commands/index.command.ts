import { EsClientService } from '@kotka/api/elasticsearch';
import { SpecimenSearchService } from '@kotka/api/specimen-search';
import { Command, Console } from 'nestjs-console';
import { specimenIndices, indices, ElasticIndex } from '@kotka/shared/models';
import ora from 'ora';
import { getId } from '@kotka/shared/utils';
import { ExtractorFieldMappingService } from '@kotka/api/specimen-search';

interface Options {
  batch: number,
  removeOrphans: boolean
}

@Console()
export class IndexCommand {
  constructor (
    private readonly esClientService: EsClientService,
    private readonly specimenSearchService: SpecimenSearchService,
    private readonly extractorFieldMappingService: ExtractorFieldMappingService,
  ) {}

  @Command({
    command: 'index-specimens [id]',
    description: 'Index specimens from laji-store, either all or by optional comma separated URI or QName id(s) list',
    options: [
      {
        flags: '-b, --batch <batch>',
        description: 'Size of reindex batch.',
        defaultValue: 1000,
        required: false
      },
      {
        flags: '-rm, --remove-orphans',
        description: 'Remove orphaned deleted specimens from the index.',
        defaultValue: false,
        required: false
      }
    ],
  })
  async indexData(id: string, options: Options) {
    const ids = id?.split(',').map(id => getId(id));
    const batch = options.batch;

    const spin = ora();
    spin.start('Indexing...');

    const batchCallback = (count: number, total: number) => {
      spin.text = `Indexing (${count}/${total})...`;
    };

    const esErrorCallback = (error: any) => {
      spin.fail('Error indexing documents!');
      console.error('Error: ', error);
    };

    try {
      const before = new Date();

      const indexedCount = await this.specimenSearchService.indexSpecimens({ids, batchSize: batch, batchCallback, esErrorCallback});

      spin.succeed(`Indexing completed, indexed ${indexedCount} item(s)${ids && indexedCount !== ids.length ? ` (expected ${ids.length} from given ids)` : ''}`);

      if (!options.removeOrphans) return;

      spin.start('Removing orphaned specimens...');

      await this.specimenSearchService.removeOlderThan(before);

      return spin.info('Orphaned specimens removed.');
    } catch (err) {
      console.error(err);
      spin.fail('Indexing error!');
      return;
    }
  }

  @Command({
    command: 'index-specimen-delete <id>',
    description: 'Delete specimens from the index by comma-separated URI:s or QNames',
  })
  async indexSpecimenDelete(id: string) {
    const ids = id.split(',');
    const spin = ora();

    spin.start('Deleting specimens...');

    try {
      const res = await this.specimenSearchService.deleteByDocumentQNames(ids);

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
      await this.esClientService.deleteIndices(specimenIndices);
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

  @Command({
    command: 'update-field-mappings'
  })
  async fieldMappings() {

    const spin = ora();
    spin.start('Initializing field mappings...');
    try {
      await this.extractorFieldMappingService.initLabelCaches();
      spin.succeed('Field mappings initialized.');
    } catch (err) {
      console.error(err);
      spin.fail('Error initializing field mappings!');
    }
  }
}
