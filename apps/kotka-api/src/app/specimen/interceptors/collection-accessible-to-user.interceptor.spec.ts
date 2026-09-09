import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CollectionAccessibleToUserInterceptor } from './collection-accessible-to-user.interceptor';
import { Collection } from '@luomus/laji-schema/models';
import { OldKotkaDataService } from '@kotka/api/services';

const adminProfile = {
  id: 'MA.1',
  roleKotka: 'MA.admin',
  roles: ['MA.admin'],
  organisation: ['MOS.org1'],
};

const profileWithoutOrganisations = {
  id: 'MA.4',
  roleKotka: 'MA.user',
};

const profile1 = {
  id: 'MA.2',
  roleKotka: 'MA.user',
  organisation: ['MOS.org1'],
};

const profile2 = {
  id: 'MA.3',
  roleKotka: 'MA.user',
  organisation: ['MOS.org2'],
};

const mockCollections: Record<string, Collection> = {
  'collection1': {
    id: 'collection1',
    collectionQuality: 'MY.collectionQualityEnum1',
    collectionName: { en: 'Collection 1', fi: 'Kokoelma 1' },
    collectionType: 'MY.collectionTypeMixed',
    personResponsible: 'Me',
    contactEmail: 'nonsense@test.fi',
    description: { en: 'Description', fi: 'Kuvaus' },
    intellectualRights: 'MY.intellectualRightsARR',
    owner: 'MOS.org1',
  },
  'collection2': {
    id: 'collection2',
    collectionQuality: 'MY.collectionQualityEnum1',
    collectionName: { en: 'Collection 2', fi: 'Kokoelma 2' },
    collectionType: 'MY.collectionTypeGardenArea',
    personResponsible: 'You',
    contactEmail: 'nonsense@test.fi',
    description: { en: 'Description', fi: 'Kuvaus' },
    intellectualRights: 'MY.intellectualRightsCC-BY',
    owner: 'MOS.org2',
  },
};

const mockOldKotkaDataService = {
  getCollections: jest.fn().mockImplementation((collectionIDs: string[]) => {
    if (collectionIDs.includes('error')) {
      return Promise.reject(new Error('Some random error'));
    }

    const collections: Collection[] = [];

    collectionIDs.forEach(id => {
      if (mockCollections[id]) {
        collections.push(mockCollections[id]);
      }
    });

    return Promise.resolve(collections);
  })
};

describe('CollectionAccessibleToUserInterceptor', () => {
  let collectionAccessibleToUserInterceptor: CollectionAccessibleToUserInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [Reflector, CollectionAccessibleToUserInterceptor,
        { provide: OldKotkaDataService, useValue: mockOldKotkaDataService },
      ],
    }).compile();

    collectionAccessibleToUserInterceptor = moduleRef.get<CollectionAccessibleToUserInterceptor>(CollectionAccessibleToUserInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('GET is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
      })
    })});

    const mockNext = createMock<CallHandler>();

    collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
  });

  it('POST search is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          path: '/_search',
        }),
      }),
      getHandler: () => ({ name: 'search' })
    });

    const mockNext = createMock<CallHandler>();

    collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
  });

  it('DELETE is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'DELETE',
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
  });

  it('PUT request with no user profile throws error', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(500);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/': ['User profile not found in request']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('POST request with no user profile throws error', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(500);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/': ['User profile not found in request']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('PUT request with no user organization throws error', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profileWithoutOrganisations },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(500);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/': ['User does not belong to any organisations']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('POST request with no user organization throws error', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profileWithoutOrganisations },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(500);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/': ['User does not belong to any organisations']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('PUT request with no document-level collectionID in body throws error', async () => {
    const mockBody = {
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profile1 },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(422);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/collectionID': ['CollectionID is required field']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('POST request with no document-level collectionID in body throws error', async () => {
    const mockBody = {
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profile1 },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(422);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({'/collectionID': ['CollectionID is required field']});
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
    }
  });

  it('Admin user is allowed to use collections they don\'t have access to', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: adminProfile },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(0);
  });

  it('User is allowed to use collections they have access to', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profile1 },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(1);
  });

  it('User is not allowed to use collections they do not have access to', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'collection1',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profile2 },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(422);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({
        '/collectionID': ['User does not have access to collection collection1'],
        '/gatherings/0/units/0/samples/0/collectionID': ['User does not have access to collection collection1']
      });
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(1);
    }
  });

  it('Handle error in retrieving collections', async () => {
    const mockBody = {
      collectionID: 'collection1',
      gatherings: [{
        units: [{
          samples: [{
            collectionID: 'error',
          }],
        }],
      }]
    };

    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          user: { profile: profile2 },
          body: mockBody,
        })
      })
    });

    const mockNext = createMock<CallHandler>();

    expect.assertions(5);
    try {
      await collectionAccessibleToUserInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.status).toEqual(500);
      expect(e.response.errorCode).toEqual('VALIDATION_EXCEPTION');
      expect(e.response.details).toEqual({
        '/': ['Error fetching collection data to check user access rights: Some random error'],
      });
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(mockOldKotkaDataService.getCollections).toHaveBeenCalledTimes(1);
    }
  });
});
