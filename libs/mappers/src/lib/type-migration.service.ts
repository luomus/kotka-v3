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
      'transactionRequestReceived': 'requestReceived',
      'externalTransactionID': 'externalID',
      'oldLoanID': 'legacyID',
      'sentType': 'transportMethod',
      'sentParcels': 'numberOfParcels',
      'transactionSent': 'outgoingSent',
      'transactionReturned': 'outgoingReturned',
      'localPerson': [ 'localPerson', 'localHandler' ],
      'away': 'awayIDs',
      'awayOther': 'awayCount',
      'returned': 'returnedIDs',
      'returnedOther': 'returnedCount',
      'missing': 'missingIDs',
      'missingOther': 'missingCount',
      'damaged': 'damagedIDs',
      'damagedOther': 'damagedCount'
    }
  };

  private ignoreValue = {
    'HRA.transaction': [
      'publicityRestrictions',
      'permitStatus',
      'permitType',
      'id',
    ]
  };

  private valueMap = {
    'HRA.transaction': {
      'status': {
        type: 'partial',
        target: "HRA.transactionStatus",
        replacer: "HRX.status",
      },
      'sentType': {
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
      return object.map(data => this.migrate(type, data) as T);
    } else {
      return this.migrate(type, object) as T;
    }
  }

  private migrate(type: string, object: Record<string, any>) {
    const toReturn = {};

    Object.keys(object).forEach(key => {
      const value = object[key];
      const newKey = this.typeMap[type][key] || key;

      if (Array.isArray(newKey)) {
        newKey.forEach(key => {
          this.mapProp(type, key, value, toReturn);
        });
      } else {
        this.mapProp(type, newKey, value, toReturn);
      }
    });

    return toReturn;
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
      to[key] = this.migrate(type, value);
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

    return value;
  }
}
