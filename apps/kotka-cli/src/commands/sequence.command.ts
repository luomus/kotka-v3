import { LajiStoreService } from '@kotka/api/services';
import { Command, Console } from 'nestjs-console';
import ora from 'ora';
import { lastValueFrom } from 'rxjs';

interface Options {
  offset: number
}

@Console()
export class SequenceCommand {
  constructor (
    private readonly lajiStoreService: LajiStoreService,
  ) {}

  @Command({
    command: 'sequence-create <sequence>',
    options: [
      {
        flags: '-o, --offset <offset>',
        description: 'Offset from which the created sequence starts from, defaults to 1',
        required: false
      }
    ],
    description: 'Create a new sample/preparation additional ID sequence'
  })
  async createSequence(sequence: string, options: Options) {
    const offset = options['offset'];
    const spin = ora();

    try {
      spin.start(`Adding new sequence "${sequence}" to lajistore`);

      await lastValueFrom(this.lajiStoreService.postSequence(sequence, offset));

      spin.succeed(`Added new sequence "${sequence}" to lajistore`);
    } catch (e) {
      spin.fail(`Failure adding new sequence: ${e.message}`);
    }
  }
}
