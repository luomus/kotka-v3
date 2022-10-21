/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, OnModuleInit } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { parse, serialize, graph } from 'rdflib';
import { compact, toRDF } from 'jsonld';
import { SchemaService } from '@kotka/api-services';
import { StoreObject } from '@kotka/shared/models';

const documentTypes = [
  'GX.dataset',
  'MY.document',
  'MY.collection'
];

@Injectable()
export class TriplestoreMapperService implements OnModuleInit {
  constructor (
    private schemaService: SchemaService,
  ) {}

  triplestoreToJson (data, type): Promise<StoreObject> {
    const baseUrl = 'http://tun.fi/';
    const store = graph();
    
    return new Promise((resolve, reject) => {
      parse(data, store, baseUrl, 'application/rdf+xml');
      serialize(null, store, baseUrl, 'application/ld+json', async (err, data) => {
        const jsonld = JSON.parse(data);
        
        try {
        const json = await compact(jsonld, this.fromContext[type]);
        
        if (json['@graph']) {
          resolve(json['@graph']);
        }

        delete json['@context'];
        resolve(json);
        } catch (err) {
          console.log(err);
        }

      });
    });
  }

  async jsonToTriplestore (data, type): Promise<string> {
    const baseUrl = 'http://tun.fi/';
    const store = graph();

    data['@context'] = this.returnContext[type];

    if (data['@type']) {
      data['@type'] = data['@type'].replace('.', 'IIII');
    }

    const rdf = await toRDF(data, {format: 'application/n-quads'});

    return new Promise( (resolve, reject) => {
      parse(rdf, store, baseUrl, 'application/n-quads', (err, data) => {

        serialize(null, data, undefined, 'application/rdf+xml', (err, data) => {
          data = data.replace(/IIII/g, '.').replace(/:tun/g, '').replace(/tun:/g, '');
          resolve(data);
        });
      });
    });
  }
  
  documentMaps = {};
  fromContext = {};
  returnContext = {};

  async onModuleInit() {
    await Promise.all(documentTypes.map(async documentType => {
      await this.initContext(documentType);
    }));
  }

  private async initContext(type: string) {
    try {
      const ctx = await lastValueFrom(this.schemaService.getContext(type).pipe(map(res => res.data)));

      const ctx2 = { '@context': {} };
      const ctx3 = { '@context': {} };

      let defaultNS = '';

      if (ctx['@context']['default']) {
        defaultNS = ctx['@context']['default'];

        delete ctx['@context']['default'];
      }

      Object.keys(ctx['@context']).forEach(key => {
        if (key === '@context') {
          return;
        }

        if (typeof ctx['@context'][key] === 'object') {
          if (ctx['@context'][key]['@id'] && defaultNS) {
            ctx['@context'][key]['@id'] = ctx['@context'][key]['@id'].replace('default:', defaultNS);
          }
          ctx2['@context'][key] = { ...ctx['@context'][key] };
          ctx3['@context'][key] = { ...ctx['@context'][key] };
        } else {
          ctx2['@context'][key] = ctx['@context'][key];
          ctx3['@context'][key] = ctx['@context'][key];
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
      });

      this.fromContext[type] = ctx2;
      this.returnContext[type] = ctx3;
    } catch (err) {
      console.log(err);
    }
  }
}