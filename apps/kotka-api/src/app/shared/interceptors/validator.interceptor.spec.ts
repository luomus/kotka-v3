import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { ValidatorInterceptor } from './validator.interceptor';
import { Reflector } from '@nestjs/core';
import {
  AbschService,
  defaultNamespaceID,
  NamespaceService,
  ValidationService,
  LajiApiService,
  FormService,
  LajiStoreService } from '@kotka/api/services';
import { of } from 'rxjs';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

const mockLajiApiService = {
  post: jest.fn().mockImplementation((path, body) => {
    const coordinates = body.geometries[0].coordinates;

    if (coordinates.toString() === [27, 62].toString()) {
      return of({ data: {
        'results': [
          {
            'address_components': [
              {
                'short_name': {
                  'sv': 'Kangasniemi',
                  'fi': 'Kangasniemi'
                },
                'types': [
                  'municipality'
                ]
              }
            ],
            'place_id': 'ML.425',
            'types': [
              'municipality'
            ]
          },
          {
            'address_components': [
              {
                'short_name': {
                  'fi': 'Etelä-Savo',
                  'sv': 'Södra Savolax'
                },
                'types': [
                  'region'
                ]
              }
            ],
            'types': [
              'region'
            ]
          }
        ]
      }});
    } else {
      return of({ data: {
        'results': []
      }});
    }
  })
};

const mockNamespaceService = {
  getNamespaces: jest.fn().mockImplementation(() => Promise.resolve([{
      namespace_id: 'AA',
      person_in_charge: '',
      purpose: '',
      namespace_type: 'all',
      qname_prefix: ''
    },{
      namespace_id: 'AB',
      person_in_charge: '',
      purpose: '',
      namespace_type: 'zoo',
      qname_prefix: 'utu'
    },{
      namespace_id: 'AC',
      person_in_charge: '',
      purpose: '',
      namespace_type: 'botany',
      qname_prefix: 'utu'
    },
    {
      namespace_id: 'AD',
      person_in_charge: '',
      purpose: '',
      namespace_type: 'all',
      qname_prefix: 'all'
    }
  ]))
};

const mockLajiStoreService = {
  search: jest.fn(),
  getAll: jest.fn()
};

const mockFormService = {
  getForm: jest.fn()
};

const mockAbschService = {
  checkIRCCNumberIsValid: jest.fn()
};

const mockForm = {
  'schema': {
    'type': 'object',
    'properties': {
      'owner': {
        'type': 'string',
        'title': 'Owner of record'
      },
      'datasetType': {
        'type': 'string',
        'oneOf': [
          {
            'const': '',
            'title': ''
          },
          {
            'const': 'GX.datasetTypeProject',
            'title': 'Project'
          }
        ],
        'title': 'Dataset type'
      },
      'datasetName': {
        'type': 'object',
        'properties': {
          'fi': {
            'type': 'string'
          },
          'sv': {
            'type': 'string'
          },
          'en': {
            'type': 'string'
          }
        },
        'title': 'Name'
      },
      'personsResponsible': {
        'type': 'string',
        'title': 'Person(s) responsible'
      },
      'description': {
        'type': 'object',
        'properties': {
          'fi': {
            'type': 'string'
          },
          'sv': {
            'type': 'string'
          },
          'en': {
            'type': 'string'
          }
        },
        'title': 'Description'
      },
      'researchFundingSource': {
        'type': 'string',
        'title': 'Research funding source'
      },
      'researchFundingRecipient': {
        'type': 'string',
        'title': 'Research funding recipient'
      },
      'researchFundingDuration': {
        'type': 'string',
        'title': 'Research funding duration'
      },
      'researchCollaborator': {
        'type': 'string',
        'title': 'Research collaborator(s)'
      },
      'benefitsDerivedAndShared': {
        'type': 'string',
        'title': 'Benefits derived and shared'
      }
    },
    'required': [
      'owner',
      'datasetName',
      'personsResponsible'
    ]
  },
  'validators': {
    'owner': {
      'format': {
        'pattern': '^MOS\\.\\d+',
        'message': 'Unknown organization'
      }
    },
    'datasetName': {
      'properties': {
        'en': {
          'presence': {
            'message': 'Required field.'
          },
          'remote': {
            'validator': 'kotkaDatasetNameUnique'
          }
        }
      }
    },
    'description': {
      'properties': {
        'en': {
          'presence': {
            'message': 'Required field.'
          }
        }
      }
    }
  },
  'warnings': {},
};

const specimenNamespaceValidatorSchema = {
  'schema': {
    'type': 'object',
    'properties': {
      'datatype': {
        'type': 'string',
        'title': 'Datatype'
      },
      'namespaceID': {
        'type': 'string',
        'title': 'Identifier namespace ID'
      },
      'objectID': {
        'type': 'string',
        'title': 'Identifier object ID'
      }
    },
    'required': [
      'datatype'
    ]
  },
  'validators': {
    'namespaceID': {
      'remote': {
        'validator': 'kotkaAllowedNamespace'
      }
    },
  },
};

const specimenOriginalSpecimenIDValidatorSchema = {
  'schema': {
    'type': 'object',
    'properties': {
      'originalSpecimenID': {
        'type': 'string',
        'title': 'Original catalogue number'
      }
    }
  },
  'validators': {
    'originalSpecimenID': {
      'remote': {
        'validator': 'kotkaSequenceUnique'
      }
    }
  }
};

const sampleAdditionalIDsValidatorsSchema = {
  'schema': {
    'type': 'object',
    'properties': {
      'gatherings': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'units': {
              'type': 'array',
              'items': {
                'type': 'object',
                'properties': {
                  'samples': {
                    'type': 'array',
                    'items': {
                      'type': 'object',
                      'properties': {
                        'additionalIDs': {
                          'type': 'array',
                          'items': {
                            'type': 'string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  'validators': {
    'gatherings': {
      'items': {
        'properties': {
          'units': {
            'items': {
              'properties': {
                'samples': {
                  'items': {
                    'properties': {
                      'additionalIDs': {
                        'items': {
                          'remote': {
                            'validator': 'kotkaSequenceUnique'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const specimenMunicipalityCordinateValidatorSchema = {
  'schema': {
    'type': 'object',
    'properties': {
      'datatype': {
        'type': 'string',
        'title': 'Datatype'
      },
      'gatherings': {
        'type': 'array',
        'items': {
          'type': 'object',
          'properties': {
            'latitude': {
              'type': 'string',
              'title': 'Latitude'
            },
            'longitude': {
              'type': 'string',
              'title': 'Longitude'
            },
            'coordinateSystem': {
              'type': 'string',
              'title': 'Coordinate system',
              'oneOf': [
                {
                  'const': '',
                  'title': ''
                },
                {
                  'const': 'MY.coordinateSystemYkj',
                  'title': 'YKJ'
                },
                {
                  'const': 'MY.coordinateSystemWgs84',
                  'title': 'WGS84'
                },
                {
                  'const': 'MY.coordinateSystemEtrs-tm35fin',
                  'title': 'ETRS-TM35FIN'
                }
              ]
            },
            'municipality': {
              'type': 'string',
              'title': 'Municipality'
            }
          }
        }
      }
    },
    'required': [
      'datatype'
    ]
  },
  'validators': {
    'gatherings': {
      'items': {
        'properties': {
          'municipality': {
            'remote': {
              'validator': 'kotkaMuncipalityCoordinates'
            }
          },
        }
      }
    }
  },
};

describe('ValidationInterceptor', () => {
  let validatorInterceptor: ValidatorInterceptor;
  let lajiStoreService: LajiStoreService;
  let formService: FormService;
  let namespaceService: NamespaceService;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [ValidatorInterceptor, ValidationService, Reflector,
        { provide: NamespaceService, useValue: mockNamespaceService },
        { provide: LajiApiService, useValue: mockLajiApiService },
        { provide: LajiStoreService, useValue: mockLajiStoreService },
        { provide: FormService, useValue: mockFormService },
        { provide: AbschService, useValue: mockAbschService }
      ],
    }).compile();

    validatorInterceptor = moduleRef.get<ValidatorInterceptor>(ValidatorInterceptor);
    lajiStoreService = moduleRef.get<LajiStoreService>(LajiStoreService);
    formService = moduleRef.get<FormService>(FormService);
    reflector = moduleRef.get<Reflector>(Reflector);
    namespaceService = moduleRef.get<NamespaceService>(NamespaceService);

    jest.spyOn(lajiStoreService, 'search').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [] }} as AxiosResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('General validator tests', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
      jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(mockForm)));
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

  describe('Dataset kotkaDatasetNameUnique tests', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockImplementation(() => 'GX.dataset');
      jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(mockForm)));
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
      jest.spyOn(lajiStoreService, 'search').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [{id: 'GX.1'}] }} as AxiosResponse));
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
  });

  describe('Specimen kotkaAllowedNamespace tests', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockImplementation(() => 'MY.document');
      jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(specimenNamespaceValidatorSchema)));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('Correct namespace for given type causes no error', async () => {
      const mockBody = {
        namespaceID: 'AB',
        objectID: '123',
        datatype: 'zoospecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);

      const req = mockContext.switchToHttp().getRequest();
      expect(req).toEqual(mockRequest);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('Unknown namespace for given datatype causes validation error', async () => {
      const mockBody = {
        namespaceID: 'BB',
        objectID: '123',
        datatype: 'zoospecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(1);
        expect(e.options).toEqual({namespaceID:{errors:['Unknown namespace "BB".']}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });

    it('Incorrect namespace for given datatype causes validation error', async () => {
      const mockBody = {
        namespaceID: 'AC',
        objectID: '123',
        datatype: 'zoospecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(1);
        expect(e.options).toEqual({namespaceID:{errors:['Namespace "AC" is not allowed for specimen of type "zoospecimen".']}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });

    it('Explicit default namespace causes validation error', async () => {
      const mockBody = {
        namespaceID: defaultNamespaceID,
        objectID: '123',
        datatype: 'zoospecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(0);
        expect(e.options).toEqual({namespaceID:{errors:[`Namespace ${defaultNamespaceID} is default and should not be used explicitly.`]}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });

     it('Namespace with type "all" for given datatype causes no validation error', async () => {
      const mockBody = {
        namespaceID: 'AA',
        objectID: '123',
        datatype: 'zoospecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);

      const req = mockContext.switchToHttp().getRequest();
      expect(req).toEqual(mockRequest);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('If namespaceID has a correct prefix for the namespace no validation error', async () => {
      const mockBody = {
        namespaceID: 'utu:AC',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);

      const req = mockContext.switchToHttp().getRequest();
      expect(req).toEqual(mockRequest);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('If namespaceID has incorrect prefix for to namespace causes validation error', async () => {
      const mockBody = {
        namespaceID: 'tun:AC',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(1);
        expect(e.options).toEqual({namespaceID:{errors:['Unacceptable prefix in namespace, has "tun" but accepts only "utu".']}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });

    it('If namespace has prefix type "all" allow any prefix without validation error', async () => {
      const mockBody = {
        namespaceID: 'utu:AD',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);

      const req = mockContext.switchToHttp().getRequest();
      expect(req).toEqual(mockRequest);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('If namespace has empty prefix type accept "tun" prefix', async () => {
      const mockBody = {
        namespaceID: 'tun:AA',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);

      const req = mockContext.switchToHttp().getRequest();
      expect(req).toEqual(mockRequest);
      expect(mockNext.handle).toHaveBeenCalledTimes(1);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
    });

    it('If namespace has empty prefix type don\'t accept prefix other than "tun"', async () => {
      const mockBody = {
        namespaceID: 'utu:AA',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(1);
        expect(e.options).toEqual({namespaceID:{errors:['Unacceptable prefix in namespace, has "utu" but accepts only "tun".']}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });

    it('If prefix not one of the known ones throw error', async () => {
      const mockBody = {
        namespaceID: 'test:AA',
        objectID: '123',
        datatype: 'botanyspecimen',
        gatherings: []
      };
      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();
      expect.assertions(3);

      try {
        await validatorInterceptor.intercept(mockContext, mockNext);
      } catch (e) {
        expect(namespaceService.getNamespaces).toBeCalledTimes(1);
        expect(e.options).toEqual({namespaceID:{errors:['Unknown prefix "test" not accepted.']}});
        expect(mockNext.handle).toBeCalledTimes(0);
      }
    });
  });

  describe('Specimen municipality coordinates tests', () => {
    beforeEach(() => {
      jest.spyOn(reflector, 'get').mockImplementation(() => 'MY.document');
      jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(specimenMunicipalityCordinateValidatorSchema)));
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('If municipality and coordinates do not match throw error', async () => {
      const mockBody = {
        datatype: 'botanyspecimen',
        gatherings: [
          {
            latitude: '62',
            longitude: '27',
            municipality: 'Porvoo',
            coordinateSystem: 'MY.coordinateSystemWgs84'
          }
        ]
      };

      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const lajiApiBody = {
        'type': 'GeometryCollection',
        'geometries': [{
          'type': 'Point',
          'coordinates': [27, 62]
        }]
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

        expect.assertions(5);
        try {
          await validatorInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          expect(mockLajiApiService.post).toHaveBeenCalledTimes(1);
          expect(mockLajiApiService.post.mock.calls[0][0]).toEqual('coordinates/location');
          expect(mockLajiApiService.post.mock.calls[0][1]).toEqual(lajiApiBody);
          expect(e.options).toEqual({gatherings:{'0':{municipality:{errors:['Coordinates do not match municipality, has Porvoo but coordinates correspond to Kangasniemi']}}}});
          expect(mockNext.handle).toBeCalledTimes(0);
        }
    });

    it('If municipality and coordinates match allow request to continue', async () => {
      const mockBody = {
        datatype: 'botanyspecimen',
        gatherings: [
          {
            latitude: '62',
            longitude: '27',
            municipality: 'Kangasniemi',
            coordinateSystem: 'MY.coordinateSystemWgs84'
          }
        ]
      };

      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const lajiApiBody = {
        'type': 'GeometryCollection',
        'geometries': [{
          'type': 'Point',
          'coordinates': [27, 62]
        }]
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);
      expect(mockLajiApiService.post).toHaveBeenCalledTimes(1);
      expect(mockLajiApiService.post.mock.calls[0][0]).toEqual('coordinates/location');
      expect(mockLajiApiService.post.mock.calls[0][1]).toEqual(lajiApiBody);
      expect(mockNext.handle).toBeCalledTimes(1);
    });

    it('If lajiapi returns no municipalities, for non-finnish coordinates, allow request to proceed', async () => {
      const mockBody = {
        datatype: 'botanyspecimen',
        gatherings: [
          {
            latitude: '0',
            longitude: '0',
            municipality: 'Berlin',
            coordinateSystem: 'MY.coordinateSystemWgs84'
          }
        ]
      };

      const mockRequest = {
        method: 'POST',
        body: mockBody
      };

      const lajiApiBody = {
        'type': 'GeometryCollection',
        'geometries': [{
          'type': 'Point',
          'coordinates': [0, 0]
        }]
      };

      const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
        getRequest: () => mockRequest
      })});

      const mockNext = createMock<CallHandler>();

      await validatorInterceptor.intercept(mockContext, mockNext);
      expect(mockLajiApiService.post).toHaveBeenCalledTimes(1);
      expect(mockLajiApiService.post.mock.calls[0][0]).toEqual('coordinates/location');
      expect(mockLajiApiService.post.mock.calls[0][1]).toEqual(lajiApiBody);
      expect(mockNext.handle).toBeCalledTimes(1);
    });
  });

  describe('Specimen sequence uniqueness tests', () => {
    describe('OriginalSpecimenID', () => {
      beforeEach(() => {
        jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(specimenOriginalSpecimenIDValidatorSchema)));
      });
      it('If no other specimen with originalSpecimenID is found no error is produced', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            originalSpecimenID: '2025:1'
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [] }} as AxiosResponse));

        await validatorInterceptor.intercept(mockContext, mockNext);

        const req = mockContext.switchToHttp().getRequest();
        expect(req).toEqual(mockRequest);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
        expect(lajiStoreService.getAll).toHaveBeenCalledTimes(1);
      });

      it('If another specimen with originalSpecimenID is found throw an error', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            originalSpecimenID: '2025:1'
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [{ id: 'JA.1', originalSpecimenID: '2025:1' }] }} as AxiosResponse));

        expect.assertions(4);
        try {
          await validatorInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          const req = mockContext.switchToHttp().getRequest();
          expect(req).toEqual(mockRequest);
          expect(lajiStoreService.getAll).toHaveBeenCalledTimes(1);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
          expect(e.options).toEqual({originalSpecimenID:{errors:['Found duplicates in other documents, found in JA.1.']}});
        }
      });
    });
    describe('Specimen addtionalIDs', () => {
      beforeEach(() => {
        jest.spyOn(formService, 'getForm').mockImplementation(() => new Promise((resolve) => resolve(sampleAdditionalIDsValidatorsSchema)));
      });

      it('No duplicates of additionalIDs within document or in store wont cause an error', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            gatherings: [{
              units: [{
                samples: [{
                  additionalIDs: ['test:1111', 'test:2222']
                },{
                  additionalIDs: ['test:3333']
                }]
              }]
            }]
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [] }} as AxiosResponse));

        await validatorInterceptor.intercept(mockContext, mockNext);

        const req = mockContext.switchToHttp().getRequest();
        expect(req).toEqual(mockRequest);
        expect(lajiStoreService.getAll).toHaveBeenCalledTimes(3);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('No duplicates of additionalIDs within document or in store other than self wont cause an error', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            id: 'JA.1',
            gatherings: [{
              units: [{
                samples: [{
                  additionalIDs: ['test:1111', 'test:2222']
                },{
                  additionalIDs: ['test:3333']
                }]
              }]
            }]
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [{
          id: 'JA.1',
          gatherings: [{
            units: [{
              samples: [{
                additionalIDs: ['test:1111', 'test:2222']
              },{
                additionalIDs: ['test:3333']
              }]
            }]
          }]
        }]}} as AxiosResponse));

        await validatorInterceptor.intercept(mockContext, mockNext);

        const req = mockContext.switchToHttp().getRequest();
        expect(req).toEqual(mockRequest);
        expect(lajiStoreService.getAll).toHaveBeenCalledTimes(3);
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
      });

      it('Duplicate additionalIDs within document causes error', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            gatherings: [{
              units: [{
                samples: [{
                  additionalIDs: ['test:1111', 'test:2222']
                },{
                  additionalIDs: ['test:1111']
                }]
              }]
            }]
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [] }} as AxiosResponse));

        try {
          await validatorInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          const req = mockContext.switchToHttp().getRequest();
          expect(req).toEqual(mockRequest);
          expect(lajiStoreService.getAll).toHaveBeenCalledTimes(1);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
          expect(e.options.gatherings[0].units[0].samples[1].additionalIDs[0].errors).toEqual(['Duplicate values found within submitted document.']);
          expect(e.options.gatherings[0].units[0].samples[0].additionalIDs[0].errors).toEqual(['Duplicate values found within submitted document.']);

        }
      });

      it('Duplicate additionalIDs in store causes error', async () => {
        const mockRequest = {
          method: 'POST',
          params: {
            validator: 'kotkaSequenceUnique',
          },
          body: {
            gatherings: [{
              units: [{
                samples: [{
                  additionalIDs: ['test:1111', 'test:2222']
                },{
                  additionalIDs: ['test:3333']
                }]
              }]
            }]
          }
        };

        const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
          getRequest: () => (mockRequest)
        })});

        const mockNext = createMock<CallHandler>();
        jest.spyOn(lajiStoreService, 'getAll').mockImplementation(() => of({ status: 200, statusText: '', headers: {}, config: {}, data:{ member: [{
          id: 'JA.2',
          gatherings: [{
            units: [{
              samples: [{
                additionalIDs: ['test:3333', 'test:4444']
              }]
            }]
          }]
        }]}} as AxiosResponse));

        try {
          await validatorInterceptor.intercept(mockContext, mockNext);
        } catch (e) {
          const req = mockContext.switchToHttp().getRequest();
          expect(req).toEqual(mockRequest);
          expect(lajiStoreService.getAll).toHaveBeenCalledTimes(3);
          expect(mockNext.handle).toHaveBeenCalledTimes(0);
          expect(e.options.gatherings[0].units[0].samples[1].additionalIDs[0].errors).toEqual(['Found duplicates in other documents, found in JA.2.']);
        }
      });
    });
  });
});
