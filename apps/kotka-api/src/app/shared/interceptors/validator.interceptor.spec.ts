import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { ValidatorInterceptor } from './validator.interceptor';
import { ApiServicesModule, FormService, LajiStoreService } from '@kotka/api-services';
import { Reflector } from '@nestjs/core';
import { ValidationService } from '../services/validation.service';
import { of } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

const mockForm = {
  "schema": {
    "type": "object",
    "properties": {
      "owner": {
        "type": "string",
        "title": "Owner of record"
      },
      "datasetType": {
        "type": "string",
        "oneOf": [
          {
            "const": "",
            "title": ""
          },
          {
            "const": "GX.datasetTypeProject",
            "title": "Project"
          }
        ],
        "title": "Dataset type"
      },
      "datasetName": {
        "type": "object",
        "properties": {
          "fi": {
            "type": "string"
          },
          "sv": {
            "type": "string"
          },
          "en": {
            "type": "string"
          }
        },
        "title": "Name"
      },
      "personsResponsible": {
        "type": "string",
        "title": "Person(s) responsible"
      },
      "description": {
        "type": "object",
        "properties": {
          "fi": {
            "type": "string"
          },
          "sv": {
            "type": "string"
          },
          "en": {
            "type": "string"
          }
        },
        "title": "Description"
      },
      "researchFundingSource": {
        "type": "string",
        "title": "Research funding source"
      },
      "researchFundingRecipient": {
        "type": "string",
        "title": "Research funding recipient"
      },
      "researchFundingDuration": {
        "type": "string",
        "title": "Research funding duration"
      },
      "researchCollaborator": {
        "type": "string",
        "title": "Research collaborator(s)"
      },
      "benefitsDerivedAndShared": {
        "type": "string",
        "title": "Benefits derived and shared"
      }
    },
    "required": [
      "owner",
      "datasetName",
      "personsResponsible"
    ]
  },
  "validators": {
    "owner": {
      "format": {
        "pattern": "^MOS\\.\\d+",
        "message": "Unknown organization"
      }
    },
    "datasetName": {
      "properties": {
        "en": {
          "presence": {
            "message": "Required field."
          },
          "remote": {
            "validator": "kotkaDatasetNameUnique"
          }
        }
      }
    },
    "description": {
      "properties": {
        "en": {
          "presence": {
            "message": "Required field."
          }
        }
      }
    }
  },
  "warnings": {},
};

describe('ValidationInterceptor', () => {
  let validatorInterceptor: ValidatorInterceptor;
  let lajiStoreService: LajiStoreService;
  let formService: FormService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule],
      controllers: [],
      providers: [ValidatorInterceptor, ValidationService, Reflector],
    }).compile();

    validatorInterceptor = moduleRef.get<ValidatorInterceptor>(ValidatorInterceptor);
    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    formService = moduleRef.get<FormService>(FormService);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(mockForm) ));
    jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
    jest.spyOn(lajiStoreService, 'search').mockImplementation((type, body) => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [] }} as AxiosResponse));
  });

  it('Missing body in request results in error thrown in validator', async () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
      })
    })});

    const mockNext = createMock<CallHandler>();

    expect.assertions(2);
    try {
      await validatorInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.message).toEqual('No request body to validate.');
      expect(mockNext.handle).toBeCalledTimes(0);
    }
  });

  it('Missing required property in body results in thrown error from schema', async () => {
     const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: {
          owner: 'MOS.1',
          datasetName: {
            en: 'Test'
          }
        }
      })
     })});

     const mockNext = createMock<CallHandler>();

     expect.assertions(2);

     try {
      await validatorInterceptor.intercept(mockContext, mockNext);
     } catch (e) {
      expect(JSON.stringify(e)).toContain('must have required property \'personsResponsible\'');
      expect(mockNext.handle).toBeCalledTimes(0);
     }
  });

  it('Missing required property specified in validators results in thrown error from validators', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: {
          owner: 'MOS.1',
          datasetName: {
            fi: 'Test'
          },
          personsResponsible: 'Tester'
        }
      })
     })});

     const mockNext = createMock<CallHandler>();

     expect.assertions(2);

     try {
      await validatorInterceptor.intercept(mockContext, mockNext);
     } catch (e) {
      expect(JSON.stringify(e)).toContain('"datasetName":{"en":{"errors":["Required field."]}');
      expect(mockNext.handle).toBeCalledTimes(0);
     }
  });

  it('Error in overriden remote validation for datasetName uniqueness results in error being thrown', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: {
          owner: 'MOS.1',
          datasetName: {
            en: 'Test'
          },
          personsResponsible: 'Tester'
        }
      })
     })});

     const mockNext = createMock<CallHandler>();
     jest.spyOn(lajiStoreService, 'search').mockImplementation((type, body) => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [{id: 'GX.1'}] }} as AxiosResponse));
     expect.assertions(3);

     try {
      await validatorInterceptor.intercept(mockContext, mockNext);
     } catch (e) {
      expect(lajiStoreService.search).toBeCalledTimes(1);
      expect(JSON.stringify(e)).toContain('"datasetName":{"en":{"errors":["Dataset name must be unique."]}');
      expect(mockNext.handle).toBeCalledTimes(0);
     }
  });

  it('Correct body results in no errors and a call to next handler.', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: {
          owner: 'MOS.1',
          datasetName: {
            en: 'test'
          },
          personsResponsible: 'Tester'
        }
      })
    })});

    const mockNext = createMock<CallHandler>();

    await validatorInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('Failure to fetch the mock form results in no calls to next handler and thrown error', async () => {
    jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise(() => { throw new InternalServerErrorException('Unable to fetch form for validation.', 'Message'); }));
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: {
          owner: 'MOS.1',
          datasetName: {
            en: 'Test'
          },
          personsResponsible: 'Tester'
        }
      })
    })});

    const mockNext = createMock<CallHandler>();

    expect.assertions(2);

    try {
      await validatorInterceptor.intercept(mockContext, mockNext);
     } catch (e) {
      expect(JSON.stringify(e)).toContain('Unable to fetch form for validation.');
      expect(mockNext.handle).toBeCalledTimes(0);
     }
  });
});
