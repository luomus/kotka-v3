import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

interface CountryLinkResult {
  grouped?: {
    governmentSchemaIdentifier_s?: {
      groups?: {
        doclist?: {
          docs?: {
            rec_title?: string;
            url_ss?: string[];
          }[];
        };
      }[];
    };
  };
}

export interface LinkData {
  url: string;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class AbschService {
  private countryLinksUrl =
    'https://api.cbd.int/api/v2013/index/select?fl=id,+identifier_s,+uniqueIdentifier_s,+url_ss,+government_s,rec_countryName:government_EN_t,+rec_title:title_EN_t,+rec_summary:description_t,rec_type:type_EN_t,+entryIntoForce_dt,adoption_dt,retired_dt,limitedApplication_dt&group=true&group.field=governmentSchemaIdentifier_s&group.limit=10&group.ngroups=true&q=(realm_ss:abs)+AND+NOT+version_s:*+AND+schema_s:(authority+absProcedure+absNationalReport)+AND+government_s:%country%&rows=500&start=0&wt=json';
  private maxCountryLinks = 3;
  private countryLinksCache: Record<string, Observable<LinkData[]>> = {};

  constructor(private httpClient: HttpClient) {}

  getCountryLinks(country?: string): Observable<LinkData[]> {
    if (!country) {
      return of([]);
    }

    if (!this.countryLinksCache[country]) {
      const url = this.countryLinksUrl.replace(
        '%country%',
        country.toLocaleLowerCase(),
      );
      this.countryLinksCache[country] = this.httpClient
        .get<CountryLinkResult>(url)
        .pipe(
          map((result) => {
            const countryLinks: LinkData[] = [];

            (
              result.grouped?.governmentSchemaIdentifier_s?.groups || []
            ).forEach((data) => {
              (data.doclist?.docs || []).forEach((doc) => {
                if (countryLinks.length >= this.maxCountryLinks) {
                  return;
                }
                if (doc.rec_title && doc.url_ss?.[0]) {
                  countryLinks.push({
                    url: doc.url_ss[0],
                    text: doc.rec_title,
                  });
                }
              });
            });

            return countryLinks;
          }),
          shareReplay(1),
        );
    }

    return this.countryLinksCache[country];
  }
}
