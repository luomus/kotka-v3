import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { OrganizationFullNameInterceptor } from './organization-fullname.interceptor';
describe('OrganizationFullNameInterceptor', () => {
  let fullNameInterceptor: OrganizationFullNameInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [OrganizationFullNameInterceptor],
    }).compile();

    fullNameInterceptor = moduleRef.get<OrganizationFullNameInterceptor>(OrganizationFullNameInterceptor);

    jest.useFakeTimers();
  });

  it('GET method result in no changes to body and call to next without error', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
    getRequest: () => ({
      method: 'GET',
      params: { id: 'MOS.1' },
    })
  })});

  const mockNext = createMock<CallHandler>();

  fullNameInterceptor.intercept(mockContext, mockNext);

  const req = mockContext.switchToHttp().getRequest();
  expect(req).toEqual({ method: 'GET', params: { id: 'MOS.1' }});
  expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('DELETE method result in no changes to body and call to next without error', () => {
    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
    getRequest: () => ({
      method: 'DELETE',
      params: { id: 'MOS.1' },
    })
  })});

  const mockNext = createMock<CallHandler>();

  fullNameInterceptor.intercept(mockContext, mockNext);

  const req = mockContext.switchToHttp().getRequest();
  expect(req).toEqual({ method: 'DELETE', params: { id: 'MOS.1' }});
  expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('POST request containing body with full levels and abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL3, ENL2, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('POST request containing body with full levels but no abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ENL4, ENL3, ENL2, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('POST request containing body with missing levels and a abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('POST request containing body with multiple languages, missing levels and a abbreviation produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1',
        fi: 'FIL1',
        sv: 'SVL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3',
        sv: 'SVL3'
      },
      organizationLevel4: {
        en: 'ENL4',
        fi: 'FIL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL3, ENL2, ENL1',
      fi: 'ABC - FIL4, FIL1',
      sv: 'ABC - SVL3, SVL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'POST',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'POST', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('PUT request containing body with full levels and abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL3, ENL2, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('PUT request containing body with full levels but no abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ENL4, ENL3, ENL2, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('PUT request containing body with missing levels and a abbreviation for one language produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1'
      },
      organizationLevel4: {
        en: 'ENL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });

  it('PUT request containing body with multiple languages, missing levels and a abbreviation produces correct fullName', () => {
    const mockBody = {
      abbreviation: 'ABC',
      organizationLevel1: {
        en: 'ENL1',
        fi: 'FIL1',
        sv: 'SVL1'
      },
      organizationLevel2: {
        en: 'ENL2'
      },
      organizationLevel3: {
        en: 'ENL3',
        sv: 'SVL3'
      },
      organizationLevel4: {
        en: 'ENL4',
        fi: 'FIL4'
      }
    };
    const fullName = {
      en: 'ABC - ENL4, ENL3, ENL2, ENL1',
      fi: 'ABC - FIL4, FIL1',
      sv: 'ABC - SVL3, SVL1'
    };

    const mockContext = createMock<ExecutionContext>({switchToHttp: () => ({
      getRequest: () => ({
        method: 'PUT',
        body: mockBody
      })
    })});

    const mockNext = createMock<CallHandler>();

    fullNameInterceptor.intercept(mockContext, mockNext);

    const req = mockContext.switchToHttp().getRequest();
    expect(req).toEqual({method: 'PUT', body: { ...mockBody, fullName }});
    expect(mockNext.handle).toBeCalledTimes(1);
  });
});