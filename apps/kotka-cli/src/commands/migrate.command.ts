import { LajiStoreService, TriplestoreService } from "@kotka/api/services";
import { TriplestoreMapperService, TypeMigrationService } from "@kotka/api/mappers";
import { Command, Console } from "nestjs-console";
import { lastValueFrom, map } from "rxjs";
import { Organization, StoreObject } from '@kotka/shared/models';
import ora from 'ora';
import { getId, getOrganizationFullName } from '@kotka/shared/utils';

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
    private readonly triplestoreMapperService: TriplestoreMapperService,
    private readonly typeMigrationService: TypeMigrationService,
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
        description: 'Size of transfer batch.',
        defaultValue: 100,
        required: false
      },
      {
        flags: '-o, --offset <offset>',
        defaultValue: 0,
        required: false
      },
      {
        flags: '-s, --seq',
        description: 'Flag to parse maximum ID number for setting up sequence to laji-store.',
        required: false
      },
      {
        flags: '--dr, --dry-run',
        description: 'Selecting if converted data is only shown, or sent to laji-store.',
        required: false
      }
    ],
    description: 'Migrate items of specified type from triplestore to laji-store'
  })
  async migrateData(type: string, options: Options) {
    const limit = this.parseOptionToInt(options.limit);
    let offset = this.parseOptionToInt(options.offset);
    let maxSeq = 0;
    let count = 0;

    const spin = ora();
    spin.start('Transfering items from Triplestore to laji-store');

    const foundQnames = [];
    const parseNestedOrganizationIds = (org: Record<string, any>, orgList: Array<string>) => {
      if (org['MZ.owner'] && org['MZ.owner']['MOS.organization']) {
        const owner = org['MZ.owner']['MOS.organization']['rdf:about'];

        if (!foundQnames.includes(owner)) {
          foundQnames.push(owner);

          orgList.push(getId(owner));
        }

        parseNestedOrganizationIds(org['MZ.owner']['MOS.organization'], orgList);
      }
    };

    do {
      try {
        const triplestoreList = await lastValueFrom(this.triplestoreService.search({ type: type }, { format: 'JSON', limit: limit, offset: offset }).pipe(
          map(data => {
            const qnameList = [];
            data.data['rdf:RDF'][type]?.forEach(obj => {
              qnameList.push(getId(obj['rdf:about']));

              if (type === 'MOS.organization') {
                foundQnames.push(obj['rdf:about']);
                parseNestedOrganizationIds(obj, qnameList);
              }
            });
            return qnameList;
          })
        ));

        if (triplestoreList.length === 0) {
          break;
        } else {
          offset += limit;
        }

        const jsonData: StoreObject[] = [];

        for (let i = 0; i < triplestoreList.length; i = i + 10) {
          const subList = triplestoreList.slice(i, i + 10);

          const tripleStoreData = await lastValueFrom(this.triplestoreService.get(subList.join('+'), { resulttype: 'TREE' }));

          const parsedData = await this.triplestoreMapperService.triplestoreToJson(tripleStoreData.data, type);

          if (Array.isArray(parsedData)) {
            jsonData.push(...parsedData);
          } else {
            jsonData.push(parsedData);
          }
        }

        const migrateDatasetType = (data) => {
          if (!data['datasetType'] || data['datasetType'] === '') {
            data['datasetType'] = 'GX.datasetTypeBasic';
          }
        };


        const migrateSpecimenTransactionPrivacy = (data) => {
          if (data['publicityRestrictions'] === undefined) {
            data['publicityRestrictions'] === 'MZ.publicityRestrictionsPrivate';
          }
        };

        const migrateOrganizationFullName = (data) => {
          if (data['fullName'] === undefined) {
            data['fullName'] = getOrganizationFullName(data);
          }
        };

        const migrateOrganizationDates = (data: Organization) => {
          if (data['dateOrdersDue'] !== undefined && data['dateOrdersDue'].includes('.')) {
            const dateParts = data['dateOrdersDue'].split('.');
            data['dateOrdersDue'] = dateParts.reverse().join('-');
          }

          data['dateCreated'] = data['dateCreated'] ? new Date(data['dateCreated']).toISOString() : (data['dateEdited'] ? new Date(data['dateEdited']).toISOString() : undefined);
          data['dateEdited'] = data['dateEdited'] ? new Date(data['dateEdited']).toISOString() : (data['dateCreated'] ? new Date(data['dateCreated']).toISOString() : undefined);
        };

        const migrateOrganizationHidden = (data: Organization) => {
          if (data.hidden === undefined) {
            data.hidden = false;
          }
        };

        if (type.includes('dataset')) {
          if (Array.isArray(jsonData)) {
            jsonData.forEach(data => {
              migrateDatasetType(data);
            });
          } else {
            migrateDatasetType(jsonData);
          }
        } else if (type.includes('specimenTransaction')) {
          if (Array.isArray(jsonData)) {
            jsonData.forEach(data => {
              migrateSpecimenTransactionPrivacy(data);
            });
          } else {
            migrateSpecimenTransactionPrivacy(jsonData);
          }
        } else if (type.includes('organization')) {
          if (Array.isArray(jsonData)) {
            jsonData.forEach(data => {
              migrateOrganizationFullName(data as Organization);
              migrateOrganizationDates(data as Organization);
              migrateOrganizationHidden(data as Organization);

            });
          } else {
            migrateOrganizationFullName(jsonData);
            migrateOrganizationDates(jsonData);
            migrateOrganizationHidden(jsonData);
          }
        }

        if (options['seq']) {
          const tempMaxSeq = this.findMaxID(jsonData);

          if (tempMaxSeq > maxSeq) maxSeq = tempMaxSeq;
        }

        count += Array.isArray(jsonData) ? jsonData.length : 1;

        if (options['dryRun']) {
          if (Array.isArray(jsonData)) {
            jsonData.forEach(data => {
              console.log(JSON.stringify(data, null, 2));
            });
          } else {
            console.log(JSON.stringify(jsonData, null, 2));
          }
        } else {
          const mappedType = this.typeMigrationService.mapClasses[type];
          await lastValueFrom(this.lajiStoreService.post(this.getType(mappedType ? mappedType : type), jsonData));
        }
      } catch (err) {
        if (err.response.status === 404 && offset === 0) {
          spin.fail('No transferable items found.');
        } else {
          spin.fail(err.message);
          if (err.response.status === 422) {
            console.error(JSON.stringify(JSON.parse(err.config.data), null, 2));
            console.error(JSON.stringify(err.response.data.error, null, 2));
          }
        }
      }
    } while (offset < 1000000);

    if (options.seq) {
      spin.succeed(`Transfer done, moved ${count} items, maximum sequence: ${maxSeq}`);
      return;
    }
    spin.succeed(`Transfer done, moved ${count} items`);
  }

  @Command({
    command: 'convert <type> <id>',
    description: 'convert an item of specified type from triplestore to laji-store'
  })
  async convertData(type: string, id: string) {
    try {
      const triplestoreData = await lastValueFrom(this.triplestoreService.get(id, { resulttype: 'TREE' }));
      const jsonData = await this.triplestoreMapperService.triplestoreToJson(triplestoreData.data, type);

      console.log(JSON.stringify(jsonData, null, '  '));
    } catch (err) {
      console.log(err);
    }
  }

  @Command({
    command: 'return <type> <id>',
    description: 'convert an item of specified type from laji-store to triplestore'
  })
  async returnData(type: string, id: string) {
    try {
      const lajistoreData = await lastValueFrom(this.lajiStoreService.get(type, id).pipe(map(res => res.data)));
      const triplestoreData = await this.triplestoreMapperService.jsonToTriplestore(lajistoreData, type);

      await lastValueFrom(this.triplestoreService.put(id, triplestoreData));
    } catch (err) {
      console.log(err);
    }
  }
}
