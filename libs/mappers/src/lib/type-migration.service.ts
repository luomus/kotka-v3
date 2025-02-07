/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeMigrationService {
  private typeMap = {
    'HRA.transaction': {
      'transactionStatus': 'status',
      'transactionType': 'type',
      'externalTransactionID': 'externalID',
      'oldLoanID': 'legacyID',
      'sentType': 'transportMethod',
      'sentParcels': 'numberOfParcels',
      'localPerson': [ 'localPerson', 'localHandler' ],
      'away': 'awayIDs',
      'awayOther': 'awayCount',
      'HRA.away': 'awayCount',
      'returned': 'returnedIDs',
      'returnedOther': 'returnedCount',
      'HRA.returned': 'returnedCount',
      'missing': 'missingIDs',
      'missingOther': 'missingCount',
      'HRA.missing': 'missingCount',
      'damaged': 'damagedIDs',
      'damagedOther': 'damagedCount',
      'HRA.damaged': 'damagedCount'
    }
  };

  private conditionalMapping = {
    'HRA.transaction': {
      'conditionalField': 'transactionType',
      'conditions': {
        'HRA.transactionTypeLoanIncoming': {
          'incomingReceived': 'transactionRequestReceived',
          'incomingReturned': 'transactionSent'
        },
        'HRA.transactionTypeLoanOutgoing': {
          'requestReceived': 'transactionRequestReceived',
          'outgoingSent': ['transactionSent', 'transactionRequestReceived'],
          'outgoingReturned': 'transactionReturned'
        },
        'HRA.transactionTypeGiftIncoming': {
          'incomingReceived': 'transactionRequestReceived',
        },
        'HRA.transactionTypeGiftOutgoing': {
          'requestReceived': 'transactionRequestReceived',
          'outgoingSent': ['transactionSent', 'transactionRequestReceived'],

        },
        'HRA.transactionTypeExchangeIncoming': {
          'incomingReceived': 'transactionRequestReceived'
        },
        'HRA.transactionTypeExchangeOutgoing': {
          'requestReceived': 'transactionRequestReceived',
          'outgoingSent': ['transactionSent', 'transactionRequestReceived'],
        },
        'HRA.transactionTypeFieldCollection': {
          'incomingReceived': 'transactionRequestReceived'
        },
        'HRA.transactionTypeVirtualLoanOutgoing': {
          'requestReceived': 'transactionRequestReceived',
          'outgoingSent': ['transactionSent', 'transactionRequestReceived'],
        },
      },
    }
  };

  integerValues = [
    'HRA.away',
    'awayOther',
    'HRA.returned',
    'returnedOther',
    'HRA.missing',
    'missingOther',
    'HRA.damaged',
    'damagedOther'
  ];

  private ignoreValue = {
    'HRA.transaction': [
      'publicityRestrictions',
      'permitStatus',
      'permitType',
      'id',
    ]
  };

  private ignoreProperty = {
    'HRA.transaction': [
      'availableForGeneticResearchNotes',
      'HRA.geneticResearchAllowed',
      'correspondenceHeaderOrganizationCode',
      'localDepartment',
      'ids',
      'transactionRequestReceived',
      'transactionSent',
      'transactionReturned',
    ]
  };

  private multiLangToString = {
    'HRA.transaction': {
      'material': 'en',
      'internalRemarks': 'en',
      'publicRemarks': 'en',
      'numberOfParcels': 'en'
    }
  };

  private valueMap = {
    'HRA.transaction': {
      'status': {
        type: 'partial',
        target: "HRA.transactionStatus",
        replacer: "HRX.status",
      },
      'transportMethod': {
        type: 'partial',
        target: "HRA.sentType",
        replacer: "HRX.transportMethod",
      },
      'type': {
        type: 'partial',
        target: 'HRA.transactionType',
        replacer: 'HRX.type'
      }
    }
  };

  public mapClasses = {
    'HRA.transaction': 'HRX.specimenTransaction'
  };

  private prefixes = {
    'HRA.transaction': {
      new: 'HRX',
      old: 'HRA'
    }
  };

  public migrateObjectType<F, T>(type: string, object: F | Array<F>): T | T[] {
    if (Array.isArray(object)) {
      return object.map(data => {
        const mapped = this.migrate<T>(type, data);
        this.specialMapping<F, T>(type, data, mapped);
        return mapped;
      });
    } else {
      const mapped = this.migrate<T>(type, object);
      this.specialMapping<F, T>(type, object, mapped);
      return mapped;
    }
  }

  private specialMapping<F, T>(type: string, object: F, toReturn: T) {
    const conditionalField = object[this.conditionalMapping[type]['conditionalField']];
    const mappings = this.conditionalMapping[type]['conditions']?.[conditionalField];

    if (!mappings) return;


    Object.keys(mappings).forEach(key => {
      if (!Array.isArray(mappings[key])) {
        return this.mapProp(type, key, object[mappings[key]], toReturn);
      }

      const value = object[mappings[key][0]] ? object[mappings[key][0]] : object[mappings[key][1]];
      this.mapProp(type, key, value, toReturn);
    });
  }

  private migrate<T>(type: string, object: Record<string, any>) {
    const toReturn = {};
    Object.keys(object).forEach(key => {
      const value = object[key];
      const newKey = this.typeMap[type][key] || key;

      if (this.ignoreProperty[type].includes(newKey)) return;

      if (this.integerValues.includes(key)) {
        return toReturn[newKey] = Math.abs(Number.parseInt(value));
      }

      if (Array.isArray(newKey)) {
        newKey.forEach(key => {
          this.mapProp(type, key, value, toReturn);
        });
      } else {
        this.mapProp(type, newKey, value, toReturn);
      }
    });

    return toReturn as T;
  }
  
  private mapProp (type: string, key: string, value: any, to: Record<string, any>) {
    if (Array.isArray(value)) {
      to[key] = value.map(val => {
        if (typeof val === 'object' && val !== null) {
          return this.migrate(type, val);
        } else {
          return this.getValue(type, key, val);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      if (this.multiLangToString[type][key]) {
        to[key] = this.getValue(type, key, value[this.multiLangToString[type][key]]);
      } else {
        to[key] = this.migrate(type, value);
      }
    } else {
      to[key] = this.getValue(type, key, value);
    }
  }

  private getValue (type, key, value) {
    if (key === '@type') return this.mapClasses[value] || value;
    if (this.ignoreValue[type].includes(key)) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(val => this.getValue(type, key, val));
    }

    const valueMapping = this.valueMap[type][key];
    if (typeof value === 'string' && valueMapping) {
      if (valueMapping.type === 'partial') {
        return value.replace(valueMapping.target, valueMapping.replacer);
      } else {
        return valueMapping.map[value];
      }
    }

    if (typeof value === 'string' && value.startsWith(this.prefixes[type]['old'])) {
      return value.replace(this.prefixes[type]['old'], this.prefixes[type]['new']);
    }

    //Fix incorrect date format in some genetic resource aquisition dates if needed.
    //if (key === 'geneticResourceAcquisitionDate' && typeof value === 'string' && value.includes('.')) {
    //  value = value.split('.').reverse().join('-');
    //};

    return value;
  }

  reverseValueMap(type: string, field: string, value: string) {
    if (!value || typeof value !== 'string') return value;

    if (this.valueMap[type][field]) {
      return value.replace(this.valueMap[type][field].replacer, this.valueMap[type][field].target);
    }

    if (this.prefixes[type] && value.startsWith(this.prefixes[type].new)) {
      return value.replace(this.prefixes[type].new, this.prefixes[type].old);
    }

    return value;
  }
}
