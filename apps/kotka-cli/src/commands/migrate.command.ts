import { LajiStoreService, TriplestoreService } from "@kotka/api-services";
import { TriplestoreMapperService } from "@kotka/mappers";
import { Command, Console, createSpinner } from "nestjs-console";
import { lastValueFrom } from "rxjs";
import { StoreObject } from '@kotka/shared/models';

interface Options {
  limit: number,
  offset: number,
  seq: boolean
}

@Console()
export class MigrateCommand {
  constructor (
    private readonly triplestoreService: TriplestoreService,
    private readonly lajiStoreService: LajiStoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService
  ) {}

  private getType (typeQName) {
    const div = typeQName.indexOf('.');

    if (div < 0) {
      return typeQName;
    }
    return typeQName.substring(div + 1);
  }

  private getIDNumber(id: string) {
    const div = id.indexOf('.');
    let idString = '';

    if (div < 0) {
      idString = id;
    } else {
      idString = id.substring(div + 1);
    }

    const idNumber = parseInt(idString);

    if (isNaN(idNumber)) {
      throw new Error(`Could not parse maximum sequence from ID: ${id}`);
    }

    return idNumber;
  }

  private findMaxID (data: Array<StoreObject> | StoreObject) {
    let maxSeq = 0;
    if (Array.isArray(data)) {
      data.forEach(data => {
        const tempMaxSeq = this.findMaxID(data);

        if (maxSeq < tempMaxSeq) {
          maxSeq = tempMaxSeq;
        }
      });
    } else if (data.id && typeof data.id === 'string') {
      maxSeq = this.getIDNumber(data.id);
    }

    return maxSeq;
  }

  private parseOptionToInt (option: string | number) {
    if (typeof option === 'number') {
      return option;
    }
  
    const parsedVal = parseInt(option);

    if (isNaN(parsedVal)) {
      throw new Error('Error parsing option to integer.');
    }

    return parsedVal;
  }

  @Command({
    command: 'migrate <type>',
    options: [
      {
        flags: '-l, --limit <limit>',
        defaultValue: 1000,
        required: false
      },
      {
        flags: '-o, --offset <offset>',
        defaultValue: 0,
        required: false
      },
      {
        flags: '-s, --seq',
        required: false
      }
    ],
    description: 'Migrate items of specified type from triplestore to laji-store'
  })
  async migrateData(type: string, options: Options) {
    const limit = this.parseOptionToInt(options.limit);
    let offset = this.parseOptionToInt(options.offset);
    let stop = false;
    let maxSeq = 0;

    const spin = createSpinner();
    spin.start('Transfering items from Triplestore to laji-store');

    do {
      try {
        const triplestoreData = await lastValueFrom(this.triplestoreService.search({ type: type }, { limit: limit, offset: offset }));

        const jsonData = await this.triplestoreMapperService.triplestoreToJson(triplestoreData.data, type);

        if ((Array.isArray(jsonData) && jsonData.length < limit) || !Array.isArray(jsonData)) {
          stop = true;
        } else {
          offset += limit;
        }

        if (options.seq) {
          const tempMaxSeq = this.findMaxID(jsonData);

          if (tempMaxSeq > maxSeq) maxSeq = tempMaxSeq;
        }

        await lastValueFrom(this.lajiStoreService.post(this.getType(type), jsonData));

      } catch (err) {
        if (err.response.status === 404 && offset === 0) {
          spin.fail('No transferable items found.');
          return;
        } else if (err.response.status === 404 && offset !== 0) {
          stop = true;
        } else {
          spin.fail(err);
          return;
        }
      }
    } while (!stop);

    if (options.seq) {
      spin.succeed(`Transfer done, maximum sequence: ${maxSeq}`);
      return;
    }
    spin.succeed('Transfer done');
  }
}