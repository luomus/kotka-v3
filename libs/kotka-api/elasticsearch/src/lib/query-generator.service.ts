import { Injectable } from '@nestjs/common';

type SearchParameters = {
  target?: string,
  accepted?: true,
  pic?: true,
  loc?: string | { lat: number, lon: number, dist: string },
  identifier?: string,
  identifierAsRange?: boolean,
  q?: string,
  s?: any[],
  agg?: string[],
  page?: number,
  perPage?: number,
  aggrSize?: number,
}
@Injectable()
export class QueryGeneratorService {
  /**
  generateQueryString(index: string, queryString: string, filters: {[key: string]: string | string[] | boolean | number}) {
    const query: any = {
      index,
    }

    if (queryString) {
      query['query'] = { bool: { must: [{ query_string: { query: queryString }}]}};
    }

    if (filters) {
      if (!query['query']) {
        query['query'] = { bool: { must: []}};
      }

      const searchFilters = [];

      Object.keys(filters).forEach(key => {
        if (key === 'loc') {

        }
      })
  }

  generateGeoDIstanceQuery(loc: string | { lat: number, lon: number, dist: string }) {
    let lat: number, lon: number, dist: string;

    if (typeof loc === 'string') {
      const parts = loc.split(',');

      if (parts.length !== 3) {
        return;
      }

      lat = parseFloat(parts[0]);
      lon = parseFloat(parts[1]);
      dist = parts[2];
    } else {
      lat = loc.lat;
      lon = loc.lon;
      dist = loc.dist;
    }

    if (!lat || !lon || !dist) {
      return;
    }

    return {
      geo_distance: {
        distance: dist,
        wgs84Location: {
          lat,
          lon
        }
      }
    };
  }
  */
}
