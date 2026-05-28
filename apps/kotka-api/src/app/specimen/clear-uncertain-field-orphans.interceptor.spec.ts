import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CallHandler, ExecutionContext, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClearUncertainFieldOrphansInterceptor } from './clear-uncertain-field-orphans.interceptor';

describe('ClearUncertainFieldOrphansInterceptor', () => {
  let clearUncertainFieldOrphansInterceptor: ClearUncertainFieldOrphansInterceptor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [Reflector, ClearUncertainFieldOrphansInterceptor],
    }).compile();

    clearUncertainFieldOrphansInterceptor = moduleRef.get<ClearUncertainFieldOrphansInterceptor>(ClearUncertainFieldOrphansInterceptor);
  });

  it('GET is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({ switchToHttp: () => ({
      getRequest: () => ({
        method: 'GET',
      })
    })});

    const mockNext = createMock<CallHandler>();

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('POST search is allowed trough', async () => {
    const mockContext = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
        }),
      }),
      getHandler: () => ({ name: 'search' })
    });

    const mockNext = createMock<CallHandler>();

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
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

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
  });

  it('POST request with no unreliableFields results in unmodified body', async () => {
    const mockBody = {
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
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

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody).toEqual({
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
    });
  });

  it('POST request with unorphaned unreliableFields results in unmodified array', async () => {
    const mockBody = {
      unreliableFields: ['/gatherings/0/coordinateSystem', '/condition'],
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
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

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody).toEqual({
      unreliableFields: ['/gatherings/0/coordinateSystem', '/condition'],
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
    });
  });

  it('POST request with orphaned unreliableFields results in modified array', async () => {
    const mockBody = {
      unreliableFields: ['/gatherings/0/coordinateSystem', '/gatherings/0/longitude', '/gathering/1/longitude', '/condition', '/originalSpecimenID'],
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
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

    clearUncertainFieldOrphansInterceptor.intercept(mockContext, mockNext);

    expect(mockNext.handle).toHaveBeenCalledTimes(1);
    expect(mockBody).toEqual({
      unreliableFields: ['/gatherings/0/coordinateSystem', '/condition'],
      gatherings: [{
        coordinateSystem: 'wgs84',
      }],
      condition: 'value',
    });
  });
});
