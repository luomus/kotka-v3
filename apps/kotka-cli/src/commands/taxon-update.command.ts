import { Command, Console } from 'nestjs-console';
import ora from 'ora';
import { TaxonLinkingService } from '@kotka/api/taxon-linking';
import { EsClientService } from '@kotka/api/elasticsearch';
import { MXTaxonRankEnum } from 'libs/shared/models/src/lib/lajistore-extended-models';


@Console()
export class TaxonUpdateCommand {
  constructor (
    private readonly taxonLinkingService: TaxonLinkingService,
  ) {}


  @Command({
    command: 'taxon-update',
    description: 'Update taxa for taxon linking'
  })
  async updateTaxa() {
    const spin = ora();

    try {
      spin.start('Updating stored taxon data.');

      const count = await this.taxonLinkingService.updateTaxonLinking();

      spin.succeed(`Stored taxon data updated, ${count} taxa processed.`);
    } catch (error) {
      spin.fail(`Failed to update stored taxon data, error: ${error.message}`);
    }
  }

  @Command({
    command: 'taxon-get <name> [author] [taxonRank]',
    description: 'Get taxon by name, author and taxonRank'
  })
  async getTaxon(name: string, author?: string, taxonRank?: MXTaxonRankEnum) {
    const result = await this.taxonLinkingService.getTaxon(name, author, taxonRank);

    return console.log(JSON.stringify(result, null, 2));
  }
}

