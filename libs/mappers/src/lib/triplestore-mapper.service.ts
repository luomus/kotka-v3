/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { parse, serialize, graph } from 'rdflib';
import { compact, toRDF } from 'jsonld';
import { LajiApiService, SchemaService } from '@kotka/api-services';
import { StoreObject } from '@kotka/shared/models';
import { escapeRegExp, set } from 'lodash';
import { TypeMigrationService } from './type-migration.service';

const documentTypes = [
  'GX.dataset',
  'HRA.transaction',
  'MOS.organization',
  'MY.collection'
];

const baseUrl = 'http://tun.fi/';

@Injectable()
export class TriplestoreMapperService implements OnModuleInit {
  constructor (
    private schemaService: SchemaService,
    private lajiApiService: LajiApiService,
    private typeMigrationService: TypeMigrationService,
  ) {}

  private getType(type) {
    const div = type.lastIndexOf('/');

    if (div < 0) {
      return type;
    }
    return type.substring(div + 1);
  }

  private normalizeJsonLdType(type) {
    return type.replace(/(Class|Object)$/, '');
  }

  private parseChild(parent, childId, json) {
    const child = json.find(part => part['id'] === childId);

    if (!child) {
      if (Array.isArray(parent['MZ.hasPart'])) {
        parent['MZ.hasPart'] = parent['MZ.hasPart'].filter(part => part.id !== childId);
      } else {
        delete parent['MZ.hasPart'];
      }

      return;
    }

    this.parseChildren(child, json);

    const childType = this.getType(child['@type']);
    const parentType = this.getType(parent['@type']);

    if (!parent[this.childMaps[parentType][childType]['target']] && this.childMaps[parentType][childType]['isArray']) {
      parent[this.childMaps[parentType][childType]['target']] = [ child ];
    } else if (this.childMaps[parentType][childType]['isArray']) {
      parent[this.childMaps[parentType][childType]['target']].push(child);
    } else {
      parent[this.childMaps[parentType][childType]['target']] = child;
    }
  }

  private parseChildren(parent, json) {
    if (parent['MZ.hasPart']){
      if (Array.isArray(parent['MZ.hasPart'])) {
        parent['MZ.hasPart'].forEach(child => {
          this.parseChild(parent, child['id'], json);
        });
      } else if (typeof parent['MZ.hasPart'] === 'object' && parent['MZ.hasPart'] !== null) {
        this.parseChild(parent, parent['MZ.hasPart']['id'], json);
      }

      delete parent['MZ.hasPart'];
    }
  }

  triplestoreToJson(data, type): Promise<StoreObject | StoreObject[]> {
    const store = graph();
    return new Promise((resolve, reject) => {
      parse(data, store, baseUrl, 'application/rdf+xml');
      serialize(null, store, baseUrl, 'application/ld+json', async (err, data) => {
        let jsonld = JSON.parse(data);

        let json;

        const serializeContext = jsonld['@context'];

        if (serializeContext) {
          let newData = data;
          Object.keys(serializeContext).forEach(key =>
            newData = newData.replace(new RegExp(escapeRegExp(`${key}:`), 'g'), serializeContext[key])
          );

          jsonld = JSON.parse(newData);
        }

        if(jsonld['@graph']) {
          jsonld = jsonld['@graph'];
        }
        if (Array.isArray(jsonld)) {
          json = [];

          for (const data of jsonld) {
            if (!data['@type'][0]) continue;

            const subType = this.getType(data['@type']);

            if (subType ==='HRAB.transactionItemClass') continue;

            if (!this.fromContext[subType]) {
              await this.initContext(subType);
            }

            const parsed = await compact(data, this.fromContext[subType]);

            delete parsed['@context'];

            Object.keys(parsed).forEach(key => {
              parsed[key] = this.typeMapValue(key, parsed[key], this.typeMapContext[subType]);
            });

            json.push(parsed);
          };
        } else {
          json = await compact(jsonld, this.fromContext[type]);

          delete json['@context'];

          Object.keys(json).forEach(key => {
            json[key] = this.typeMapValue(key, json[key], this.typeMapContext[type]);
          });
        }

        if (json['@graph']) {
          json = json['@graph'];
        }

        if(Array.isArray(json)) {
          const bases = json.filter(part => part['@type'] === type);

          if (!bases) {
            reject(`Could not resolve root for document(s) of type ${type}`);
          }

          bases.forEach(base => {
            if (base['MZ.hasPart']){
              this.parseChildren(base, json);
            }
          });

          json = bases;
        }

        if (this.typeMigrationService.mapClasses[type]) {
          json = this.typeMigrationService.migrateObjectType<StoreObject[], StoreObject[]>(this.getType(type), json);
        }

        resolve(json);
      });
    });
  }

  async jsonToTriplestore (data, type): Promise<string> {
    const baseUrl = 'http://tun.fi/';
    const store = graph();

    data['@context'] = this.returnContext[type];

    if (data['@type']) {
      data['@type'] = data['@type'].replace('.', 'IIII');
    } else {
      data['@type'] = type.replace('.', 'IIII');
    }

    const rdf = await toRDF(data, {format: 'application/n-quads'});

    return new Promise( (resolve) => {
      parse(rdf, store, baseUrl, 'application/n-quads', (err, data) => {

        serialize(null, data, undefined, 'application/rdf+xml', (err, data) => {
          data = data.replace(/IIII/g, '.').replace(/:tun/g, '').replace(/tun:/g, '').replace(/rdf:datatype="http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#langString" /g, '');
          resolve(data);
        });
      });
    });
  }

  documentMaps = {};
  fromContext = {};
  returnContext = {};
  typeMapContext = {};
  childMaps = {};

  async onModuleInit() {
    await Promise.all(documentTypes.map(async documentType => {
      await this.initContext(documentType);
    }));
  }

  private async initContext(type: string) {
    const ctx = await lastValueFrom(this.schemaService.getContext(this.normalizeJsonLdType(type)).pipe(map(res => res.data)));
    const properties = await lastValueFrom(this.lajiApiService.get<Record<string, any>>(`metadata/classes/${type}/properties`).pipe(map(res => res.data?.results)));
    const ctx2 = { '@context': {} };
    const ctx3 = { '@context': {} };
    const ctx4 = {};

    let defaultNS = '';

    if (ctx['@context']['default']) {
      defaultNS = ctx['@context']['default'];

      delete ctx['@context']['default'];
    }

    const keys = Object.keys(ctx['@context']);
    for (const key of keys) {

      if (key === '@type') continue;
      if (key === '@context') continue;
      if (key.includes('herbo:sortOrder')) continue;

      if (typeof ctx['@context'][key] === 'object') {
        if (ctx['@context'][key]['@id'] && defaultNS) {
          ctx['@context'][key]['@id'] = ctx['@context'][key]['@id'].replace('default:', defaultNS);

          const property = properties?.find(property => property.property === this.getType(ctx['@context'][key]['@id']));

          if (ctx['@context'][key]['@container'] === '@set') {
            set(this.childMaps, [type, property.range[0]], { target: key, isArray: property.hasMany });
          } else if (!ctx['@context'][key]['@container'] && property?.hasMany) {
            ctx['@context'][key]['@container'] = '@set';
          }
        }

        ctx2['@context'][key] = { ...ctx['@context'][key] };
        ctx3['@context'][key] = { ...ctx['@context'][key] };
        ctx4[key] = { ...ctx['@context'][key] };
      } else {
        ctx2['@context'][key] = ctx['@context'][key];
        ctx3['@context'][key] = ctx['@context'][key];
        ctx4[key] = ctx['@context'][key];
      }

      if (ctx['@context'][key]['@type'] !== undefined && ctx['@context'][key]['@type'].includes('xsd:')) {
        delete ctx2['@context'][key]['@type'];
        delete ctx3['@context'][key]['@type'];
      }

      let val = ctx3['@context'][key]['@id'];
      if (val) {
        const loc = val.lastIndexOf('/');

        if (loc < 0) {
          val = val.replace('.', 'IIII');
        } else {
          val = val.slice(0, loc + 1) + val.slice(loc + 1).replace('.', 'IIII');
        }

        ctx3['@context'][key]['@id'] = val;
      }
    };

    this.fromContext[type] = ctx2;
    this.returnContext[type] = ctx3;
    this.typeMapContext[type] =ctx4;
  }

  private typeMapValue(key: string, value: string, context: object) {
    const defaultValueTypes = [ '@id', 'xsd:string', '@language'];
    const type = context[key]?.['@type'];

    if (!type || key === 'MZ.hasMany' || defaultValueTypes.includes(type)) return value;

    switch (type) {
      case 'xsd:boolean':
        return value === 'true';
      case 'xsd:dateTime':
      case 'xsd:date':
        return value;
      case 'xsd:integer':
        return Number(value);
      default:
        return value;
    }
  }
}
