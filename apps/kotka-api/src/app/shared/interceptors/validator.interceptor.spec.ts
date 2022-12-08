import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, UnprocessableEntityException } from '@nestjs/common';
import { UserInterceptor } from './user.interceptor';
import { ValidatorInterceptor } from './validator.interceptor';
import { ApiServicesModule, FormService } from '@kotka/api-services';
import { Reflector } from '@nestjs/core';

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
  let formService: FormService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ApiServicesModule],
      controllers: [],
      providers: [ValidatorInterceptor, Reflector],
    }).compile();

    validatorInterceptor = moduleRef.get<ValidatorInterceptor>(ValidatorInterceptor);
    formService = moduleRef.get<FormService>(FormService);
    reflector = moduleRef.get<Reflector>(Reflector);

    jest.spyOn(formService, 'getForm').mockImplementation((type) => new Promise((resolve, reject) => resolve(mockForm) ));
    jest.spyOn(reflector, 'get').mockImplementation((key, target) => 'GX.dataset');
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

  it('Correct body results in no errors and a call to next handler.', async () => {
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

    await validatorInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toBeCalledTimes(1);
  });
});