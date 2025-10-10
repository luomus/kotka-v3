import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { SpecimenIdJoinerInterceptor } from './specimen-id-joiner.interceptor';
import { NamespaceService } from '../shared/services/namespace.service';
import { AbschService, LajiApiService, LajiStoreService } from '@kotka/api/services';

const mockLajiApiService = jest.mock<LajiApiService>;
const mockLajiStoreService = jest.mock<LajiStoreService>;
const mockAbschService = jest.mock<AbschService>;
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

describe('SpecimenIdJoinerIntereptor', () => {
  let specimenIdJoinerInterceptor: SpecimenIdJoinerInterceptor;
  let namespaceService: NamespaceService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [SpecimenIdJoinerInterceptor,
      { provide: NamespaceService, useValue: mockNamespaceService },
      { provide: LajiApiService, useValue: mockLajiApiService },
      { provide: LajiStoreService, useValue: mockLajiStoreService },
      { provide: AbschService, useValue: mockAbschService },
    ],
    }).compile();

    namespaceService = moduleRef.get<NamespaceService>(NamespaceService);
    specimenIdJoinerInterceptor = moduleRef.get<SpecimenIdJoinerInterceptor>(SpecimenIdJoinerInterceptor);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Both namespaceID- and objectID-parts being present results in combined document id, and removal of namespaceID and objectID', async () => {
    const mockBody = {
      namespaceID: 'tun:AA',
      objectID: '123',
      gatherings: []
    };
    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { id: 'tun:AA.123', gatherings: [] }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
  });


    it('If namespaces has no default namespace add the default tun: to final id if it is not in namespaceID already', async () => {
    const mockBody = {
      namespaceID: 'AA',
      objectID: '123',
      gatherings: []
    };

    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'POST', body: { id: 'tun:AA.123', gatherings: [] }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
  });

  it('If namespaces has "all" add the default tun: to final id if it is not in namespaceID already', async () => {
    const mockBody = {
      namespaceID: 'AD',
      objectID: '123',
      gatherings: []
    };

    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'POST', body: { id: 'tun:AD.123', gatherings: [] }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
  });

  it('If namespaceID has a default prefix other than "all" but none in namespaceID expect it to be added', async () => {
    const mockBody = {
      namespaceID: 'AB',
      objectID: '123',
      gatherings: []
    };

    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'POST', body: { id: 'utu:AB.123', gatherings: [] }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
  });

  it('If namespace has default prefix all allow adding anything', async () => {
    const mockBody = {
      namespaceID: 'utu:AD',
      objectID: '123',
      gatherings: []
    };

    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'POST', body: { id: 'utu:AD.123', gatherings: [] }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(1);
  });

  it('If objectID is missing expect thrown bad request error',async () => {
    const mockBody = {
      namespaceID: 'JA',
      gatherings: []
    };

    const mockRequest = {
      method: 'POST',
      body: mockBody
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => (mockRequest)
    })});

    const mockNext = createMock<CallHandler>();

    expect.assertions(3);
    try {
      await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.message).toEqual('objectID must be set if namespaceID is set');
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(0);
    }
  });

  it('If namespaceID is missing expect thrown bad request error',async () => {
    const mockBody = {
      objectID: '123',
      gatherings: []
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    expect.assertions(3);
    try {
      await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);
    } catch (e) {
      expect(e.message).toEqual('namespaceID must be set if objectID is set');
      expect(mockNext.handle).toHaveBeenCalledTimes(0);
      expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(0);
    }
  });

  it('If both id-components are missing expect request to pass trough as is',async () => {
    const mockBody = {
      '@type': 'MY.document',
      gatherings: []
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'POST', body: mockBody});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(0);
  });

  it('Expect PUT-method to pass trough without errors or modifications',async () => {
    const mockBody = {
      '@type': 'MY.document',
      id: 'JA.1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        params: { id: 'JA.1' },
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'PUT', params: { id: 'JA.1' }, body: mockBody});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(0);
  });

  it('Expect GET-method to pass trough without errors',async () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
        params: { id: 'JA.1' },
      })
    })});

    const mockNext = createMock<CallHandler>();

    await specimenIdJoinerInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();

    expect(req).toEqual({method: 'GET', params: { id: 'JA.1' }});
    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(namespaceService.getNamespaces).toHaveBeenCalledTimes(0);
  });
});
