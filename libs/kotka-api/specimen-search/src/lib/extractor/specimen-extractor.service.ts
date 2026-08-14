import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';
import { BulkRequest } from '@elastic/elasticsearch/lib/api/types';
import {
  ElasticDocument,
  ElasticGathering,
  ElasticUnit,
  ElasticIdentification,
  //ElasticSample,
  ElasticType,
  //ElasticBranch,
  ElasticUnitRow,
  ElasticSample
} from '../elastic-document.interface';
//import { BranchExtractorService } from './branch-extractor.service';
import { IdentificationExtractorService } from './identification-extractor.service';
import { ExtractorValueMappingService } from '../mapper/extractor-value-mapping.service';
import { ExtractorInterface } from '@kotka/api/elasticsearch';
import { TypeExtractorService } from './type-extractor.service';
import { SampleExtractorService } from './sample-extractor.service';
import { Identification, Sample, TypeSpecimen, MediaTypes } from '@kotka/shared/models';
import { MediaApiService } from '@kotka/api/services';
import { lastValueFrom } from 'rxjs';
import { AutocompleteExtractorService } from '../../../../elasticsearch/src/lib/autocomplet-extractor.service';

const open = [
  'acquiredFromOrganization',
  'collectionID',
  'coordinateSource',
  'coordinateSystem',
  'creator',
  'datasetID',
  'earliestEpochOrLowestSeries',
  'editor',
  'fruitType',
  'georeferenceSource',
  'latestEpochOrHighestSeries',
  'lifeStage',
  'microbiologicalRiskGroup',
  'owner',
  'plantStatusCode',
  'preservation',
  'projectId',
  'provenance',
  'publicityRestrictions',
  'recordBasis',
  'recordParts',
  'samplingMethod',
  'seedMaturity',
  'seedMorphology',
  'sex',
  'status',
];

const mapOpenedIdsTo = {
  'owner': 'ownerID',
  'acquiredFromOrganization': 'acquiredFromOrganizationID'
}

const mapOpenedValuesTo = {
  'datasetID': 'dataset',
  'collectionID': 'collection',
};

const remove = [
  'gatherings',
  'units',
  'identifications',
  'typeSpecimens',
  'samples',
  'notes',
];

const removeNewLine = [
  'localityVerbatim',
  'localityDescription',
  'labelsVerbatim',
  'editNotes',
  'documentNotes',
  'gatheringNotes',
  'unitNotes',
  'identificationNotes',
  'sampleHistory',
];

const autocomplete = [
  'acquiredFrom',
  'administrativeProvince',
  'age',
  'biologicalProvince',
  'boldDescription',
  'chemistry',
  'cladVerbatim',
  'collection',
  'coordinateNotes',
  'coordinatesVerbatim',
  'country',
  'county',
  'creator',
  'dataset',
  'dataSource',
  'datatype',
  'documentLocation',
  'documentNotes',
  'editNotes',
  'editor',
  'entered',
  'exsiccatum',
  'gatheringNotes',
  'genbankDescription',
  'habitatClassification',
  'habitatDescription',
  'higherGeography',
  'labelsVerbatim',
  'language',
  'leg',
  'legID',
  'legVerbatim',
  'locality',
  'localityDescription',
  'localityVerbatim',
  'municipality',
  'populationAbundance',
  'preparations',
  'primaryDataLocation',
  'publication',
  'sampleHistory',
  'digitisers',//mapped from old transcribers
  'unitNotes',
];

const keyValueFields: { [key: string]: string } = {
  'relationship': ':',
};

@Injectable()
export class SpecimenExtractorService extends BaseExtractorService {
  constructor(
    private readonly identificationExtractor: IdentificationExtractorService,
    private readonly mediaApiService: MediaApiService,
    private readonly typeSpecimenExtractor: TypeExtractorService,
    private readonly sampleExtractor: SampleExtractorService,
    private readonly autocompleteExtractorService: AutocompleteExtractorService,
    protected readonly valueMappingService: ExtractorValueMappingService,

  ) {
    super();

    this.open = open;
    this.mapOpenedIdsTo = mapOpenedIdsTo;
    this.mapOpenedValuesTo = mapOpenedValuesTo;
    this.remove = [...this.remove, ...remove];
    this.removeNewLine = removeNewLine;
    this.keyValueFields = keyValueFields;
    this.autocompleteFields = autocomplete;
  }

  async addToBulk(document: ElasticDocument, bulk: BulkRequest): Promise<void> {
    if (!document.id) {
      return;
    }

    this.extractIDs(document);

    document.gatheringCount = 0;
    document.unitCount = 0;

    let id = document.id!;

    const images = document.images;

    if (images) {
      document.hasPicture = images.length ? true : false;
      document.pictureCount = images.length;

      delete document.images;
    } else {
      const media = await lastValueFrom(this.mediaApiService.findMediaByDocumentId(document.documentURI, MediaTypes.images));

      console.log(id, media);
      document.hasPicture = media?.length ? true : false;
      document.pictureCount = media?.length || 0;
    }

    if (document.gatherings?.length) {
      document.gatheringCount = document.gatherings.length;
      for (let gathering of document.gatherings as ElasticGathering[]) {
        id = gathering.id!;

        if (gathering.units?.length) {
          document.unitCount = gathering.units.length;

          let first = false;
          for (let unit of gathering.units as ElasticUnit[]) {
            id = unit.id!;
            const identifications = unit.identifications as Identification[];
            const typeSpecimens = unit.typeSpecimens as TypeSpecimen[];
            const samples = unit.samples as Sample[];

            if (!first) {
              unit.firstInDocument = true;
              first = true;
            }

            unit.identificationCount = identifications?.length || 0
            unit.typeCount = typeSpecimens?.length || 0;
            unit.sampleCount = samples?.length || 0;

            unit.sampleExists = !!unit.samples?.length;

            const unitRow = await this.createSpecimenRow(bulk, id, document, gathering, unit);

            await this.autocompleteExtractorService.addToBulk(unitRow, bulk, this.autocompleteFields);

            if (identifications?.length) {
              await this.identificationExtractor.addToBulk({ ...unitRow, identifications }, bulk);
            }

            if (typeSpecimens?.length) {
              await this.typeSpecimenExtractor.addToBulk({...unitRow, typeSpecimens}, bulk);
            }

            if (samples?.length) {
              await this.sampleExtractor.addToBulk({...unitRow, samples}, bulk);
            }
          }
        } else {
          await this.createSpecimenRow(bulk, id, document, gathering);
        }
      };

    } else {
      await this.createSpecimenRow(bulk, id, document);
    }

    //console.log(JSON.stringify(bulk, null, 2))
  }

  async createSpecimenRow(bulk: BulkRequest, id: string, document: ElasticDocument, gathering?: ElasticGathering, unit?: ElasticUnit) {
    if (!bulk.body || !Array.isArray(bulk.body)) {
      bulk.body = [];
    }

    bulk.body.push({
      index: {
        _id: id,
        _index: this.getIndex()
      }
    });

    if (document.notes) {
      document.documentNotes = document.notes;
      delete document.notes;
    }

    if (gathering?.notes) {
      gathering.gatheringNotes = gathering.notes;
      delete gathering.notes;
    }

    if (unit?.notes) {
      unit.unitNotes = unit.notes;
      delete unit.notes;
    }

    const row = {...document, ...gathering, ...unit} as ElasticUnitRow;

    if (row.collectionID) {
      row.collectionTree = await this.valueMappingService.getCollectionTree(row.collectionID);
    }

    this.extractDates(row);
    this.extractWGSLocation(row);

    await this.extract<ElasticUnitRow>(row);

    bulk.body.push(row);

    return row;

    //No need to handle measurement with lajistore units anymore.
  }

  extractWGSLocation(row: ElasticUnitRow) {
    const wgs84Latitude = row.wgs84Latitude ? parseFloat(row.wgs84Latitude) : undefined;
    const wgs84Longitude = row.wgs84Longitude ? parseFloat(row.wgs84Longitude) : undefined;

    if (wgs84Latitude && !(wgs84Latitude <= 90.0 && wgs84Latitude >= -90.0)) {
      delete row.wgs84Latitude;

      if (wgs84Longitude) {
        return delete row.wgs84Longitude;
      }
    }

    if (wgs84Longitude && !(wgs84Longitude <= 180.0 && wgs84Longitude >= -180.0)) {
      delete row.wgs84Longitude;

      if (wgs84Latitude) {
        return delete row.wgs84Latitude;
      }
    }

    if (row.wgs84Latitude && row.wgs84Longitude) {
      let dot = row.wgs84Latitude.indexOf('.');
      const lat = parseFloat(row.wgs84Latitude.substring(0, dot + 7));

      dot = row.wgs84Longitude.indexOf('.');
      const lon = parseFloat(row.wgs84Longitude.substring(0, dot + 7));

      row.wgs84Location = {lat, lon};
    }
  }

  extractBold(row: ElasticUnitRow) {
    this.extractIDDescription(row, 'bold');
  }

  extractGenbank(row: ElasticUnitRow) {
    this.extractIDDescription(row, 'genbank');
  }

  extractIDDescription(row: ElasticUnitRow, source: 'bold' | 'genbank') {
    const idField: 'boldID' | 'genbankID' = source + 'ID' as 'boldID' | 'genbankID';
    const descriptionField: 'boldDescription' | 'genbankDescription' = source + 'Description' as 'boldDescription' | 'genbankDescription';

    if (row[source]) {
      row[idField] = [];
      row[descriptionField] = [];

      row[source].forEach((value) => {
        const ids = value.split(';');

        ids.forEach((id) => {
          const parts = id.split(':', 2);

          if (parts.length === 2) {
            row[idField]!.push(parts[0].trim());
            row[descriptionField]!.push(parts[1].trim());
          } else {
            row[idField]!.push(parts[0].trim());
          }
        });
      });
    }
  }

  extractDates(row: ElasticUnitRow) {
    if (row.dateBegin) {

      if (!row.dateEnd) {
        row.dateEnd = row.dateBegin;
      }

      row.dateBegin = this.dateToElasticDate(row.dateBegin);
    }

    if (row.dateEnd) {
      row.dateEnd = this.dateToElasticDate(row.dateEnd, '31.12');
    }

    if (row.dateCreated) {
      row.dateCreated = this.dateTimeToElasticDateTime(row.dateCreated);
    }

    if (row.dateEdited) {
      row.dateEdited = this.dateTimeToElasticDateTime(row.dateEdited);
    }

    if (row.acquisitionDate) {
      row.acquisitionDate = this.dateTimeToElasticDateTime(row.acquisitionDate);
    }
  }

  getRelatedExtracts(): ExtractorInterface[] {
    return [
      this.identificationExtractor,
      this.typeSpecimenExtractor,
      this.sampleExtractor,
      this.autocompleteExtractorService,
    ];
  }
}
